/** Native end-to-end tests use observed UIKit names and visible text, not private state. */
import {Scenario} from 'Leaf.lspkg/Scenarios/scenario/Scenario';
import {expect} from 'Leaf.lspkg/Utils/common/Expect';
import {findSceneObjectByName,sleep} from 'Leaf.lspkg/Utils/common/Utils';
import {DefaultLeafInteractor} from 'Leaf.lspkg/Interactors/interactor/DefaultLeafInteractor';
import {findInteractablesByName} from 'Leaf.lspkg/Interactors/InteractableUtils';
import {Interactable} from 'SpectaclesInteractionKit.lspkg/Components/Interaction/Interactable/Interactable';
export function qarText(name:string):string {
  return (findSceneObjectByName(name).getComponent('Component.Text') as Text).text;
}
export async function qarTap(id:string,interactor:{trigger(target:Interactable):Promise<void>}=new DefaultLeafInteractor()):Promise<void>{
  let target=findInteractablesByName('QAR '+id,undefined,true)[0];
  // Follow the same visible control-page button available to the learner.
  for(let page=0;!target&&page<8;page++){
    const more=findInteractablesByName('QAR control-page',undefined,true)[0];
    if(!more)break;
    await interactor.trigger(more);await sleep(700);
    target=findInteractablesByName('QAR '+id,undefined,true)[0];
  }
  if(!target)throw new Error('Missing enabled QAR '+id);
  await interactor.trigger(target);await sleep(700);
}
@component
export class QuantumARExplorerLeafScenario extends Scenario {
  async run():Promise<void>{
    await sleep(1500);await qarTap('restart');
    const before=Number(qarText('BitValue'));await qarTap('toggle-bit');
    expect(Number(qarText('BitValue'))).toBe(1-before);
    await qarTap('next');expect(qarText('Heading')).toBe('Meet the Qubit');
    await qarTap('prepare-zero');expect(qarText('StateStatus').includes('100% chance of 0')).toBe(true);
    await qarTap('prepare-one');expect(qarText('StateStatus').includes('100% chance of 1')).toBe(true);
    await qarTap('prepare-plus');expect(qarText('StateStatus').includes('50% chance of 0')).toBe(true);
    await qarTap('next');expect(qarText('Heading')).toBe('Make a Measurement');
    await qarTap('prepare-zero');await qarTap('measure');
    expect(qarText('StateStatus').includes('Measurement result: 0.')).toBe(true);
    await qarTap('prepare-one');await qarTap('measure');
    expect(qarText('StateStatus').includes('Measurement result: 1.')).toBe(true);
    const countsBefore=Number(qarText('ExperimentCounts').match(/Measurements: (\d+)/)[1]);
    await qarTap('measure');
    expect(qarText('StateStatus').includes('Measurement result: 1.')).toBe(true);
    expect(Number(qarText('ExperimentCounts').match(/Measurements: (\d+)/)[1])).toBe(countsBefore+1);
    await qarTap('prepare-plus');await qarTap('measure');
    const outcome=qarText('StateStatus');
    expect(outcome.includes('Measurement result: 0.')||outcome.includes('Measurement result: 1.')).toBe(true);
    const collapsed=qarText('StateStatus');await qarTap('measure');expect(qarText('StateStatus')).toBe(collapsed);
    const counts=qarText('ExperimentCounts');const state=qarText('StateStatus');
    const station=findSceneObjectByName('QAR Bit View').getTransform();const beforePlace=station.getWorldPosition();
    await qarTap('reposition');await qarTap('place-right');
    expect(Math.abs(station.getWorldPosition().x-beforePlace.x-5)<0.01).toBe(true);
    await qarTap('place-up');await qarTap('place-farther');await qarTap('place-left');await qarTap('place-down');await qarTap('place-nearer');
    await qarTap('reposition');
    expect(qarText('ExperimentCounts')).toBe(counts);expect(qarText('StateStatus')).toBe(state);
    await qarTap('recenter');expect(Math.abs(station.getWorldPosition().z+110)<0.01).toBe(true);
    expect(qarText('ExperimentCounts')).toBe(counts);
    await qarTap('next');await qarTap('answer-always-zero');
    expect(qarText('StateStatus').includes('Try again.')).toBe(true);
    await qarTap('answer-half-each');expect(qarText('StateStatus').includes('Correct.')).toBe(true);
    await qarTap('next');expect(qarText('Heading')).toBe('Lesson Complete');
    await qarTap('restart');expect(qarText('Heading')).toBe('Meet the Bit');
    expect(Number(qarText('ExperimentCounts').match(/Measurements: (\d+)/)[1])).toBe(0);
  }
}
