# Website objectives

We plan to create a website concerned with Game AI. We will provide an editor so scenarios can be created and experienced. Users of the website can create scenarios and save them as textual "comments". The website will be arranged as a blog e.g. concerned with a particular setting, or a particular Game AI technique. There will also be a general area where users can post ideas/scenarios unrelated to the blog posts.

## The editor

The editor consists of one or more `Terminal`s and a `Stage`.

### TODO

- Can `add-to` and `delete-from` default layer via brush and a/d

- Start writing post / decide on blog format

- `ps -a` shows full process src
- How do `key` and `poll` work; can they be simplified?
- Make a blender model and import it
- Add `cat` back in as a function
- folders for variables corresponding to object

- Try building a low poly character in blender
- Beginners guide:
  - https://www.youtube.com/watch?v=7MRonzqYJgw&ab_channel=GrantAbbitt
  - https://www.youtube.com/watch?v=L0AY61v6-M4&ab_channel=GrantAbbitt
- Model: https://www.youtube.com/watch?v=4OUYOKGl7x0
- Rigging: https://www.youtube.com/watch?v=srpOeu9UUBU


- Implement comments using build and client-side calls:
  > https://eiriksm.dev/walkthrough-github-comments
- Must navigate to GitHub to actually post comments

- Basic text editor using Prism shell highlighting, for coding/scripts/funcs
- Can interface with process group via UI

### DONE

✅ have `Terminal`
✅ have `Stage`
✅ can use `Terminal` to create rectilinear polygons in `Stage`
✅ can create rectangular selection using mouse
✅ need setting/theme/story to bring it to life
   > We will remake Teleglitch on the web
✅ can `get /brush/sides`
✅ can `set /brush/sides 4`

✅ `Terminal` can run background processes
✅ can read from stage key events via `key`
✅ list processes via `ps`
  > have pid, ppid, pgid, sid, icon, src
✅ can kill processes
✅ Represent newlines in history using single char `¶` rather than `$'\n'`
✅ can `read >data`
✅ can `while read >data do ... done` and `while sleep; do echo foo`
✅ can suspend/resume processes via `kill --STOP` and `kill --CONT`
✅ Preload functions

✅ Removed `while` and more generally will not add loop
  constructs for shell. So, pipelines will not be created in loops.
✅ Use `meta.fd` rather than 'stdOut' and 'stdIn'
✅ Exactly one place `.readData` and exactly one place where `.writeData`.
✅ Stop using device proxy i.e. guard `.readData`/`.writeData`
✅ Complete code modifying `brush` on key events.
✅ Better support for multiline history: left/right/backspace
✅ Have layers with multipolygons and attribs
