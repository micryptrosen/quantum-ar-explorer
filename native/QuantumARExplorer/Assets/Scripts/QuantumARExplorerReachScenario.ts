/** Native IK coverage for supported button selection; device comfort remains unproven. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {createIKInteractor} from 'Leaf.lspkg/Interactors/interactor/ik/visualizer/BitmojiAvatar';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {qarTap,qarText} from './QuantumARExplorerLeafScenario';
@component
export class QuantumARExplorerReachScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);await qarTap('restart');
    const before=Number(qarText('BitValue'));
    const ik=createIKInteractor();
    await ik.trigger(findInteractablesByName('QAR toggle-bit',undefined,true)[0]);
    await sleep(700);expect(Number(qarText('BitValue'))).toBe(1-before);
    await ik.trigger(findInteractablesByName('QAR recenter',undefined,true)[0]);await sleep(700);
    await ik.trigger(findInteractablesByName('QAR reposition',undefined,true)[0]);await sleep(700);
    await ik.trigger(findInteractablesByName('QAR place-right',undefined,true)[0]);await sleep(700);
    await ik.trigger(findInteractablesByName('QAR reposition',undefined,true)[0]);await sleep(700);
    // Exercise every enabled lesson control through the final visible layout.
    await qarTap('next',ik);
    await qarTap('prepare-zero',ik);await qarTap('prepare-one',ik);await qarTap('prepare-plus',ik);
    await qarTap('back',ik);await qarTap('next',ik);await qarTap('next',ik);
    await qarTap('fresh-plus-ten',ik);expect(qarText('ExperimentCounts').includes('Measurements: 10 ')).toBe(true);
    await qarTap('clear-experiment',ik);expect(qarText('ExperimentCounts').includes('Measurements: 0 ')).toBe(true);
    await qarTap('measure',ik);await qarTap('next',ik);
    await qarTap('answer-alternating',ik);await qarTap('answer-always-zero',ik);await qarTap('answer-half-each',ik);
    await qarTap('next',ik);expect(qarText('Heading')).toBe('Lesson Complete');
    await qarTap('back',ik);await qarTap('restart',ik);
    expect(qarText('Heading')).toBe('1 / 3  Meet the Bit');
  }
}
