/** Simulated IK reachability of new comparison targets; no physical comfort claim. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {createIKInteractor} from 'Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar';
import {QuantumARExplorerComparison} from './QuantumARExplorerComparison';
import {QuantumARExplorerBitMain} from './QuantumARExplorerBitMain';
import {enterComparison} from './QAR011ComparisonScenario';
import {qarTap} from './QuantumARExplorerLeafScenario';
@component
export class QAR011ComparisonReachScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);await enterComparison();
    const main=findSceneObjectByName('QAR Bit Controller').getComponent(QuantumARExplorerBitMain.getTypeName()) as QuantumARExplorerBitMain;
    const comp=findSceneObjectByName('QAR Comparison Controller').getComponent(QuantumARExplorerComparison.getTypeName()) as QuantumARExplorerComparison;
    // Start with Motion off, enable it in comparison, and verify return restores the same policy.
    await qarTap('motion');const ik=createIKInteractor();await qarTap('enter-comparison',ik);await qarTap('compare-reset',ik);
    const before=JSON.stringify(comp.snapshot().model);await qarTap('compare-help',ik);await qarTap('compare-help',ik);expect(JSON.stringify(comp.snapshot().model)).toBe(before);
    await qarTap('compare-motion',ik);expect(comp.snapshot().motion).toBe(true);
    await qarTap('compare-step',ik);await qarTap('compare-step',ik);await qarTap('compare-step',ik);await qarTap('compare-step',ik);
    expect(comp.snapshot().model.a.result).toBe(1);expect(comp.snapshot().model.b.result).toBe(0);await qarTap('compare-exit',ik);expect(main.displaySnapshot().mode).toBe('lab');expect(main.displaySnapshot().motion).toBe(true);
    await qarTap('return-lesson');await qarTap('restart');await sleep(800);console.log('QAR011 COMPARISON IK PASS '+JSON.stringify({stepResetExitHelpMotionReachable:true,results:[1,0],motionPolicyRestored:true}));
  }
}
