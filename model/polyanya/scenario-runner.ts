import Point from "./structs/point";
import SearchInstance from "./search/search-instance";
import Scenario, { ScenarioJson, load_scenarios } from "./helpers/scenario";
import Mesh, { MeshJson } from "./structs/mesh";

let si: SearchInstance;
let get_path = 1;
// let verbose = 0;

export function main(
  meshJson: MeshJson,
  scenarioJsons: ScenarioJson[],
  verbose?: boolean,
) {
  const m = new Mesh(meshJson);
  si = new SearchInstance(m);
  si.verbose = verbose || false;

  const scenarios = load_scenarios(scenarioJsons);

  scenarios.forEach((scenario, i) => {
    run_scenario(i, scenario);
  });
}

function print_header() {
  return "index;micro;successor_calls;generated;pushed;popped;pruned_post_pop;length;gridcost\n";
}

export function run_scenario(index: number, scen: Scenario) {
  si.set_start_goal(scen.start, scen.goal);
  si.search();

  if (get_path) {
    const path = si.get_path_points();
    
    // #ifndef NDEBUG
    // const n = path.length;
    // let actual = si.get_cost();
    // let expected = Math.min(actual, 0.0);

    // for (let i = 1; i < n; i++) {
    //   expected += path[i].distance(path[i-1]);
    // }

    // if (Math.abs(expected - actual) > 1e-8) {
    //   console.error(`!!! bad path for ${scen.start} to ${scen.goal}`);
    // }
    // #endif

    console.log({ path });
    // console.log(`path ${index}; ${path.join(' ')}`);
  } else {
    console.log(`${index}; ${
      [
        si.get_search_micro(),
        si.successor_calls,
        si.nodes_generated,
        si.nodes_pushed,
        si.nodes_popped,
        si.nodes_pruned_post_pop,
        si.get_cost(),
        scen.gridcost,
      ].join('; ')
    }`);
  }
}
