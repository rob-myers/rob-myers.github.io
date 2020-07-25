/**
 * Originally created by Alex Bol on 4/1/2017.
 * Source: https://github.com/alexbol99/flatten-interval-tree/blob/master/dist/main.esm.js
 */

abstract class BaseInterval<Value> {
  abstract high: Value;
  abstract low: Value;
  /**
   * Clone interval
   */
  abstract clone: BaseInterval<Value>;
  /**
   * Property max returns clone of this interval
   */
  abstract max: BaseInterval<Value>;
  /**
   * Predicate returns true if this interval less than other interval
   */
  abstract less_than(other_interval: BaseInterval<Value>): boolean;
  /**
   * Predicate returns true is this interval equals to other interval
   */
  abstract equal_to(other_interval: BaseInterval<Value>): boolean;
  /**
   * Predicate returns true if this interval intersects other interval
   */
  abstract intersect(other_interval: BaseInterval<Value>): boolean;
  /**
   * Predicate returns true if this interval does not intersect other interval
   */
  abstract not_intersect(other_interval: BaseInterval<Value>): boolean;
  /**
   * Returns new interval merged with other interval
   */
  abstract merge(other_interval: BaseInterval<Value>): BaseInterval<Value>;
  /**
   * Returns how key should return
   */
  abstract output(): [Value, Value];
  /**
   * This function returns maximum between two comparable values.
   * Previously static.
   */
  abstract comparable_max(interval1: BaseInterval<Value>, interval2: BaseInterval<Value>): BaseInterval<Value>;
  /**
   * This predicate returns true if first value less than second value.
   * Previously static
   */
  abstract comparable_less_than(val1: Value, val2: Value) : boolean;
}

class Interval extends BaseInterval<number> {
  /**
   * Accept two comparable values and creates new instance of interval
   * Predicate Interval.comparable_less(low, high) supposed to return true on these values
   */
  constructor(public low: number, public high: number) {
    super();
  }

  get clone() {
      return new Interval(this.low, this.high);
  }

  get max() {
      return this.clone;   // this.high;
  }

  less_than(other_interval: Interval): boolean {
      return this.low < other_interval.low ||
          this.low == other_interval.low && this.high < other_interval.high;
  }

  equal_to(other_interval: Interval): boolean {
      return this.low == other_interval.low && this.high == other_interval.high;
  }

  intersect(other_interval: Interval): boolean {
      return !this.not_intersect(other_interval);
  }

  not_intersect(other_interval: Interval): boolean {
      return (this.high < other_interval.low || other_interval.high < this.low);
  }

  merge(other_interval: Interval): Interval {
      return new Interval(
          this.low === undefined ? other_interval.low : Math.min(this.low, other_interval.low),
          this.high === undefined ? other_interval.high : Math.max(this.high, other_interval.high)
      );
  }

  output() {
      return [this.low, this.high] as [number, number];
  }

  comparable_max(interval1: Interval, interval2: Interval): Interval {
    return interval1.merge(interval2);
  }
  
  comparable_less_than(val1: number, val2: number): boolean {
      return val1 < val2;
  }
};

const RB_TREE_COLOR_RED = 0 as 0;
const RB_TREE_COLOR_BLACK = 1 as 1;

abstract class BaseNode<Value = any, SomeInterval extends BaseInterval<Value> = BaseInterval<Value>> {
  
  abstract value: undefined | Value;
  /** reference to left child node */
  abstract left: null | BaseNode<Value, SomeInterval>;
  /** reference to right child node */
  abstract right: null | BaseNode<Value, SomeInterval>;
  /** reference to parent node */
  abstract parent: null | BaseNode<Value, SomeInterval>;
  abstract color: 0 | 1;

  abstract item: {
    key: undefined | SomeInterval;
    value: undefined | Value;
  };
  abstract max: undefined | SomeInterval;

  abstract isNil(): boolean;
  abstract less_than(other: this): boolean;
  abstract equal_to(other: this): boolean;
  abstract intersect(other: this): boolean;
  abstract copy_data(other: this): void;
  abstract update_max(): void;
  abstract not_intersect_left_subtree(node: this): boolean;
  abstract not_intersect_right_subtree(node: this): boolean;
}

/** A standard node whose value is a number */
class Node extends BaseNode<number, Interval>  {

  public item: {
    key: Interval | undefined;
    value: number | undefined;
  };
  public max: undefined | Interval;

  constructor(
    key = undefined as undefined | Interval | [number, number],
    public value = undefined as undefined | number,
    /** reference to left child node */
    public left = null as null | Node,
    /** reference to right child node */
    public right = null as null | Node,
    /** reference to parent node */
    public parent = null as null | Node,
    public color = RB_TREE_COLOR_BLACK as 0 | 1,
  ) {
      super();

      this.item = { key: undefined, value };
      if (key) {
        this.item.key = key instanceof Array
          ? new Interval(Math.min(key[0], key[1]), Math.max(key[0], key[1]))
          : key;
      }

      this.max = this.item.key ? this.item.key.max : undefined;
  }

  isNil() {
      return (this.item.key === undefined && this.item.value === undefined &&
          this.left === null && this.right === null && this.color === RB_TREE_COLOR_BLACK);
  }

  less_than(other_node: Node) {
      if (this.item.value && other_node.item.value) {
          // Previously non-numeric `this.item.value` was supported here
          const item_less_than = this.item.value < other_node.item.value;
          return this.item.key!.less_than(other_node.item.key!) ||
              this.item.key!.equal_to((other_node.item.key!)) && item_less_than;
      }
      else {
          return this.item.key!.less_than(other_node.item.key!);
      }
  }

  equal_to(other_node: Node) {
      let value_equal = true;
      if (this.item.value && other_node.item.value) {
          value_equal = this.item.value == other_node.item.value;
      }
      return this.item.key!.equal_to(other_node.item.key!) && value_equal;
  }

  intersect(other_node: Node) {
      return this.item.key!.intersect(other_node.item.key!);
  }

  copy_data(other_node: Node) {
      this.item.key = other_node.item.key!.clone;
      this.item.value = other_node.item.value;
  }

  update_max() {
      // use key (Interval) max property instead of key.high
      this.max = this.item.key ? this.item.key.max : undefined;
      if (this.right && this.right.max) {
          this.max = this.item.key!.comparable_max(this.max!, this.right.max);
      }
      if (this.left && this.left.max) {
          this.max = this.item.key!.comparable_max(this.max!, this.left.max);
      }
  }

  // Other_node does not intersect any node of left subtree, if this.left.max < other_node.item.key.low
  not_intersect_left_subtree(search_node: Node) {
      return this.left!.max!.high < search_node.item.key!.low;
  }

  // Other_node does not intersect right subtree if other_node.item.key.high < this.right.key.low
  not_intersect_right_subtree(search_node: Node) {
      const comparable_less_than = this.item.key!.comparable_less_than;  // static method
      let low = this.right!.max!.low !== undefined ? this.right!.max!.low : this.right!.item.key!.low;
      return comparable_less_than(search_node.item.key!.high, low);
  }
}


/**
* Implementation of interval binary search tree <br/>
* Interval tree stores items which are couples of {key:interval, value: value} <br/>
* Interval is an object with high and low properties or simply pair [low,high] of numeric values <br />
*/
class IntervalTree<Node extends BaseNode<Value, Interval>, Interval extends BaseInterval<Value>, Value> {
  public root: Node | null;
  public nil_node: Node;

  /**
   * Construct new empty instance of IntervalTree
   */
  constructor(public Node: { new(): Node }) {
      this.root = null;
      this.nil_node = new Node();
  }

  /**
   * Returns number of items stored in the interval tree
   */
  get size(): number {
      let count = 0;
      this.tree_walk(this.root!, () => count++);
      return count;
  }

  /**
   * Returns array of sorted keys in the ascending order
   */
  get keys() {
      let res = [] as [Value, Value][];
      this.tree_walk(this.root!, (node) =>
        res.push(node.item.key!.output()));
      return res;
  }

  /**
   * Return array of values in the ascending keys order
   */
  get values() {
      let res = [] as (Value | undefined)[];
      this.tree_walk(this.root!, (node) => res.push(node.item.value));
      return res;
  }

  /**
   * Returns array of items (<key,value> pairs) in the ascended keys order
   */
  get items() {
      let res = [] as { key: [Value, Value]; value: Value | undefined }[];
      this.tree_walk(this.root!, (node) => res.push({
          key: node.item.key!.output(),
          value: node.item.value
      }));
      return res;
  }

  /**
   * Returns true if tree is empty
   * @returns {boolean}
   */
  isEmpty(): boolean {
      return (this.root == null || this.root == this.nil_node);
  }

  /**
   * Insert new item into interval tree
   * @param key - interval object or array of two numbers [low, high]
   * @param value - value representing any object (optional)
   * @returns {Node} - returns reference to inserted node as an object {key:interval, value: value}
   */
  insert(key: undefined | Interval, value = key): undefined | Node {
      if (key === undefined) return;
      let insert_node = new (this.Node as any)(key, value, this.nil_node, this.nil_node, null, RB_TREE_COLOR_RED);
      this.tree_insert(insert_node);
      this.recalc_max(insert_node);
      return insert_node;
  }

  /**
   * Returns true if item {key,value} exist in the tree
   * @param key - interval correspondent to keys stored in the tree
   * @param value - value object to be checked
   * @returns {boolean} - true if item {key, value} exist in the tree, false otherwise
   */
  exist(key: Interval, value: undefined | Value): boolean {
      let search_node = new (this.Node as any)(key, value);
      return this.tree_search(this.root!, search_node) ? true : false;
  }

  /**
   * Remove entry {key, value} from the tree
   * @param key - interval correspondent to keys stored in the tree
   * @param value - - value object
   * @returns {boolean} - true if item {key, value} deleted, false if not found
   */
  remove(key: Interval, value: undefined | Value): boolean {
      let search_node = new (this.Node as any)(key, value) as Node;
      let delete_node = this.tree_search(this.root!, search_node);
      if (delete_node) {
          this.tree_delete(delete_node);
      }
      return !!delete_node;
  }

  /**
   * Returns array of entry values which keys intersect with given interval <br/>
   * If no values stored in the tree, returns array of keys which intersect given interval
   * @param interval - search interval, or array [low, high]
   * @param outputMapperFn(value,key) - optional function that maps (value, key) to custom output
   * @returns {Array}
   */
  search(
    interval: Interval, 
    outputMapperFn = (value: Value | undefined, key: Interval) => value ? value : key.output()
  ) {
      let search_node = new (this.Node as any)(interval) as Node;
      let resp_nodes = [] as Node[];
      this.tree_search_interval(this.root!, search_node, resp_nodes);
      return resp_nodes.map(node => outputMapperFn(node.item.value, node.item.key!))
  }

  /**
   * Tree visitor. For each node implement a callback function. <br/>
   * Method calls a callback function with two parameters (key, value)
   * @param visitor(key,value) - function to be called for each tree item
   */
  forEach(visitor: (key: Interval, value: Value | undefined) => void) {
      this.tree_walk(this.root!, (node) => visitor(node.item.key!, node.item.value));
  }

  /** Value Mapper. Walk through every node and map node value to another value
  * @param callback(value, key) - function to be called for each tree item
  */
  map(callback: (value: Value | undefined, key: Interval) => Interval | undefined) {
      const tree = new IntervalTree<Node, Interval, Value>(this.Node);
      this.tree_walk(this.root!, (node) =>
        tree.insert(node.item.key, callback(node.item.value, node.item.key!)));
      return tree;
  }

  recalc_max(node: BaseNode) {
      let node_current = node;
      while (node_current.parent != null) {
          node_current.parent.update_max();
          node_current = node_current.parent;
      }
  }

  tree_insert(insert_node: Node) {
      let current_node = this.root;
      let parent_node = null;

      if (this.root == null || this.root == this.nil_node) {
          this.root = insert_node;
      }
      else {
          while (current_node != this.nil_node) {
              parent_node = current_node;
              if (insert_node.less_than(current_node!)) {
                  current_node = current_node!.left as Node;
              }
              else {
                  current_node = current_node!.right as Node;
              }
          }

          insert_node.parent = parent_node;

          if (insert_node.less_than(parent_node as Node)) {
              parent_node!.left = insert_node;
          }
          else {
              parent_node!.right = insert_node;
          }
      }

      this.insert_fixup(insert_node);
  }

// After insertion insert_node may have red-colored parent, and this is a single possible violation
// Go upwords to the root and re-color until violation will be resolved
  insert_fixup(insert_node: BaseNode) {
      let current_node: BaseNode;
      let uncle_node: BaseNode;

      current_node = insert_node;
      while (current_node != this.root && current_node.parent!.color == RB_TREE_COLOR_RED) {
          if (current_node.parent == current_node.parent!.parent!.left) {   // parent is left child of grandfather
              uncle_node = current_node.parent!.parent!.right!;              // right brother of parent
              if (uncle_node.color == RB_TREE_COLOR_RED) {             // Case 1. Uncle is red
                  // re-color father and uncle into black
                  current_node.parent!.color = RB_TREE_COLOR_BLACK;
                  uncle_node.color = RB_TREE_COLOR_BLACK;
                  current_node.parent!.parent!.color = RB_TREE_COLOR_RED;
                  current_node = current_node.parent!.parent!;
              }
              else {                                                    // Case 2 & 3. Uncle is black
                  if (current_node == current_node.parent!.right) {     // Case 2. Current if right child
                      // This case is transformed into Case 3.
                      current_node = current_node.parent!;
                      this.rotate_left(current_node);
                  }
                  current_node.parent!.color = RB_TREE_COLOR_BLACK;    // Case 3. Current is left child.
                  // Re-color father and grandfather, rotate grandfather right
                  current_node.parent!.parent!.color = RB_TREE_COLOR_RED;
                  this.rotate_right(current_node.parent!.parent!);
              }
          }
          else {                                                         // parent is right child of grandfather
              uncle_node = current_node.parent!.parent!.left!;              // left brother of parent
              if (uncle_node.color == RB_TREE_COLOR_RED) {             // Case 4. Uncle is red
                  // re-color father and uncle into black
                  current_node.parent!.color = RB_TREE_COLOR_BLACK;
                  uncle_node.color = RB_TREE_COLOR_BLACK;
                  current_node.parent!.parent!.color = RB_TREE_COLOR_RED;
                  current_node = current_node.parent!.parent!;
              }
              else {
                  if (current_node == current_node.parent!.left) {             // Case 5. Current is left child
                      // Transform into case 6
                      current_node = current_node.parent!;
                      this.rotate_right(current_node);
                  }
                  current_node.parent!.color = RB_TREE_COLOR_BLACK;    // Case 6. Current is right child.
                  // Re-color father and grandfather, rotate grandfather left
                  current_node.parent!.parent!.color = RB_TREE_COLOR_RED;
                  this.rotate_left(current_node.parent!.parent!);
              }
          }
      }

      this.root!.color = RB_TREE_COLOR_BLACK;
  }

  tree_delete(delete_node: Node) {
      let cut_node: Node;   // node to be cut - either delete_node or successor_node  ("y" from 14.4)
      let fix_node: Node;   // node to fix rb tree property   ("x" from 14.4)

      if (delete_node.left == this.nil_node || delete_node.right == this.nil_node) {  // delete_node has less then 2 children
          cut_node = delete_node;
      }
      else {                                                    // delete_node has 2 children
          cut_node = this.tree_successor(delete_node) as Node;
      }

      // fix_node if single child of cut_node
      if (cut_node!.left != this.nil_node) {
          fix_node = cut_node.left as Node;
      }
      else {
          fix_node = cut_node.right as Node;
      }

      // remove cut_node from parent
      /*if (fix_node != this.nil_node) {*/
          fix_node.parent = cut_node.parent;
      /*}*/

      if (cut_node == this.root) {
          this.root = fix_node;
      }
      else {
          if (cut_node == cut_node.parent!.left) {
              cut_node.parent!.left = fix_node;
          }
          else {
              cut_node.parent!.right = fix_node;
          }
          cut_node.parent!.update_max();        // update max property of the parent
      }

      this.recalc_max(fix_node);              // update max property upward from fix_node to root

      // COPY DATA !!!
      // Delete_node becomes cut_node, it means that we cannot hold reference
      // to node in outer structure and we will have to delete by key, additional search need
      if (cut_node != delete_node) {
          delete_node.copy_data(cut_node);
          delete_node.update_max();           // update max property of the cut node at the new place
          this.recalc_max(delete_node);       // update max property upward from delete_node to root
      }

      if (/*fix_node != this.nil_node && */cut_node.color == RB_TREE_COLOR_BLACK) {
          this.delete_fixup(fix_node);
      }
  }

  delete_fixup(fix_node: BaseNode<any>) {
      let current_node = fix_node;
      let brother_node: BaseNode<any>;

      while (current_node != this.root && current_node.parent != null && current_node.color == RB_TREE_COLOR_BLACK) {
          if (current_node == current_node.parent.left) {          // fix node is left child
              brother_node = current_node.parent.right!;
              if (brother_node.color == RB_TREE_COLOR_RED) {   // Case 1. Brother is red
                  brother_node.color = RB_TREE_COLOR_BLACK;         // re-color brother
                  current_node.parent.color = RB_TREE_COLOR_RED;    // re-color father
                  this.rotate_left(current_node.parent);
                  brother_node = current_node.parent.right!;                      // update brother
              }
              // Derive to cases 2..4: brother is black
              if (brother_node.left!.color == RB_TREE_COLOR_BLACK &&
                  brother_node.right!.color == RB_TREE_COLOR_BLACK) {  // case 2: both nephews black
                  brother_node.color = RB_TREE_COLOR_RED;              // re-color brother
                  current_node = current_node.parent;                  // continue iteration
              }
              else {
                  if (brother_node.right!.color == RB_TREE_COLOR_BLACK) {   // case 3: left nephew red, right nephew black
                      brother_node.color = RB_TREE_COLOR_RED;          // re-color brother
                      brother_node.left!.color = RB_TREE_COLOR_BLACK;   // re-color nephew
                      this.rotate_right(brother_node);
                      brother_node = current_node.parent.right!;                     // update brother
                      // Derive to case 4: left nephew black, right nephew red
                  }
                  // case 4: left nephew black, right nephew red
                  brother_node.color = current_node.parent.color;
                  current_node.parent.color = RB_TREE_COLOR_BLACK;
                  brother_node.right!.color = RB_TREE_COLOR_BLACK;
                  this.rotate_left(current_node.parent);
                  current_node = this.root!;                         // exit from loop
              }
          }
          else {                                             // fix node is right child
              brother_node = current_node.parent.left as Node;
              if (brother_node.color == RB_TREE_COLOR_RED) {   // Case 1. Brother is red
                  brother_node.color = RB_TREE_COLOR_BLACK;         // re-color brother
                  current_node.parent.color = RB_TREE_COLOR_RED;    // re-color father
                  this.rotate_right(current_node.parent);
                  brother_node = current_node.parent.left!;                        // update brother
              }
              // Go to cases 2..4
              if (brother_node.left!.color == RB_TREE_COLOR_BLACK &&
                  brother_node.right!.color == RB_TREE_COLOR_BLACK) {   // case 2
                  brother_node.color = RB_TREE_COLOR_RED;             // re-color brother
                  current_node = current_node.parent;                              // continue iteration
              }
              else {
                  if (brother_node.left!.color == RB_TREE_COLOR_BLACK) {  // case 3: right nephew red, left nephew black
                      brother_node.color = RB_TREE_COLOR_RED;            // re-color brother
                      brother_node.right!.color = RB_TREE_COLOR_BLACK;    // re-color nephew
                      this.rotate_left(brother_node);
                      brother_node = current_node.parent.left!;                        // update brother
                      // Derive to case 4: right nephew black, left nephew red
                  }
                  // case 4: right nephew black, left nephew red
                  brother_node.color = current_node.parent.color;
                  current_node.parent.color = RB_TREE_COLOR_BLACK;
                  brother_node.left!.color = RB_TREE_COLOR_BLACK;
                  this.rotate_right(current_node.parent);
                  current_node = this.root!;                               // force exit from loop
              }
          }
      }

      current_node.color = RB_TREE_COLOR_BLACK;
  }

  tree_search(node: Node, search_node: Node): undefined | Node {
      if (node == null || node == this.nil_node)
          return undefined;

      if (search_node.equal_to(node)) {
          return node;
      }
      if (search_node.less_than(node)) {
          return this.tree_search(node.left as Node, search_node);
      }
      else {
          return this.tree_search(node.right as Node, search_node);
      }
  }

  // Original search_interval method; container res support push() insertion
  // Search all intervals intersecting given one
  tree_search_interval(node: Node, search_node: Node, res: Node[]) {
      if (node != null && node != this.nil_node) {
          // if (node->left != this.nil_node && node->left->max >= low) {
          if (node.left != this.nil_node && !node.not_intersect_left_subtree(search_node)) {
              this.tree_search_interval(node.left as Node, search_node, res);
          }
          // if (low <= node->high && node->low <= high) {
          if (node.intersect(search_node)) {
              res.push(node);
          }
          // if (node->right != this.nil_node && node->low <= high) {
          if (node.right != this.nil_node && !node.not_intersect_right_subtree(search_node)) {
              this.tree_search_interval(node.right as Node, search_node, res);
          }
      }
  }

  local_minimum(node: Node) {
      let node_min = node;
      while (node_min.left != null && node_min.left != this.nil_node) {
          node_min = node_min.left as Node;
      }
      return node_min;
  }

  // not in use
  local_maximum(node: Node) {
      let node_max = node;
      while (node_max.right != null && node_max.right != this.nil_node) {
          node_max = node_max.right as Node;
      }
      return node_max;
  }

  tree_successor(node: Node) {
      let node_successor;
      let current_node;
      let parent_node;

      if (node.right != this.nil_node) {
          node_successor = this.local_minimum(node.right as Node);
      }
      else {
          current_node = node;
          parent_node = node.parent;
          while (parent_node != null && parent_node.right == current_node) {
              current_node = parent_node;
              parent_node = parent_node.parent;
          }
          node_successor = parent_node;
      }
      return node_successor;
  }

  //           |            right-rotate(T,y)       |
  //           y            ---------------.       x
  //          / \                                  / \
  //         x   c          left-rotate(T,x)      a   y
  //        / \             <---------------         / \
  //       a   b                                    b   c

  rotate_left(x: BaseNode) {
      let y = x.right!;

      x.right = y.left;           // b goes to x.right

      if (y.left != this.nil_node) {
          y.left!.parent = x;     // x becomes parent of b
      }
      y.parent = x.parent;       // move parent

      if (x == this.root) {
          this.root = y as Node;           // y becomes root
      }
      else {                        // y becomes child of x.parent
          if (x == x.parent!.left) {
              x.parent!.left = y;
          }
          else {
              x.parent!.right = y;
          }
      }
      y.left = x;                 // x becomes left child of y
      x.parent = y;               // and y becomes parent of x

      if (x != null && x != this.nil_node) {
          x.update_max();
      }

      y = x.parent;
      if (y != null && y != this.nil_node) {
          y.update_max();
      }
  }

  rotate_right(y: BaseNode) {
      let x = y.left!;

      y.left = x.right;           // b goes to y.left

      if (x.right != this.nil_node) {
          x.right!.parent = y;        // y becomes parent of b
      }
      x.parent = y.parent;          // move parent

      if (y == this.root) {        // x becomes root
          this.root = x as Node;
      }
      else {                        // y becomes child of x.parent
          if (y == y.parent!.left) {
              y.parent!.left = x;
          }
          else {
              y.parent!.right = x;
          }
      }
      x.right = y;                 // y becomes right child of x
      y.parent = x;               // and x becomes parent of y

      if (y != null && y != this.nil_node) {
          y.update_max();
      }

      x = y.parent;
      if (x != null && x != this.nil_node) {
          x.update_max();
      }
  }

  tree_walk(node: Node, action: (node: Node) => void) {
      if (node != null && node != this.nil_node) {
          this.tree_walk(node.left as Node, action);
          // arr.push(node.toArray());
          action(node);
          this.tree_walk(node.right as Node, action);
      }
  }

  /* Return true if all red nodes have exactly two black child nodes */
  testRedBlackProperty() {
      let res = true;
      this.tree_walk(this.root!, function (node) {
          if (node.color == RB_TREE_COLOR_RED) {
              if (!(node.left!.color == RB_TREE_COLOR_BLACK && node.right!.color == RB_TREE_COLOR_BLACK)) {
                  res = false;
              }
          }
      });
      return res;
  }

  /* Throw error if not every path from root to bottom has same black height */
  testBlackHeightProperty(node: BaseNode) {
      let height = 0;
      let heightLeft = 0;
      let heightRight = 0;
      if (node.color == RB_TREE_COLOR_BLACK) {
          height++;
      }
      if (node.left != this.nil_node) {
          heightLeft = this.testBlackHeightProperty(node.left!);
      }
      else {
          heightLeft = 1;
      }
      if (node.right != this.nil_node) {
          heightRight = this.testBlackHeightProperty(node.right!);
      }
      else {
          heightRight = 1;
      }
      if (heightLeft != heightRight) {
          throw new Error('Red-black height property violated');
      }
      height += heightLeft;
      return height;
  };
}

export default IntervalTree;
export { Node, Interval };