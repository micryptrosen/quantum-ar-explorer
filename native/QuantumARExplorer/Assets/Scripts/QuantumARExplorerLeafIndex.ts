import {scenariosIndex} from 'Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator';
import {ScenarioMetadata} from 'Leaf.lspkg/Scenarios/scenario/ScenarioMetadata';
import {QuantumARExplorerLeafScenario} from './QuantumARExplorerLeafScenario';
import {QuantumARExplorerReachScenario} from './QuantumARExplorerReachScenario';
import {QuantumARExplorerPreservationScenario} from './QuantumARExplorerPreservationScenario';
@component
export class QuantumARExplorerLeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex:ScenarioMetadata[]=[
    {id:'qar006-lesson-flow',typename:QuantumARExplorerLeafScenario.getTypeName()},
    {id:'qar006-ik-bit-selection',typename:QuantumARExplorerReachScenario.getTypeName()},
    {id:'qar006-native-preservation',typename:QuantumARExplorerPreservationScenario.getTypeName()}
  ];
}
