import useMuState from "../hooks/use-mu-state";

/** @param {{ onLoad: ((api: NPC.NPCsApi) => void) }} props */
export default function NPCs(props) {

    const state = useMuState(() => {
        /** @type {NPC.NPCsApi} */
        const output = {
            apis: [],
            spawn(defs) {
                // TODO
                console.log('spawning', defs);
            },
        };
        props.onLoad(output);
        return output;
    });
    
    return (
        null
    );
}