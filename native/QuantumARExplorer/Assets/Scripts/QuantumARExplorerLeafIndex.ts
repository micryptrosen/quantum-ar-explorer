import {QAR010JudgeScenario} from './QAR010JudgeScenario';
import {scenariosIndex} from 'Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator';
import {ScenarioMetadata} from 'Leaf.lspkg/Scenarios/scenario/ScenarioMetadata';
import {QuantumARExplorerLeafScenario} from './QuantumARExplorerLeafScenario';
import {QuantumARExplorerReachScenario} from './QuantumARExplorerReachScenario';
import {QuantumARExplorerPreservationScenario} from './QuantumARExplorerPreservationScenario';
import {QuantumARExplorerVisualScenario} from './QuantumARExplorerVisualScenario';
import {QuantumARExplorerGateScenario} from './QuantumARExplorerGateScenario';
@component
export class QuantumARExplorerLeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex:ScenarioMetadata[]=[
    {id:'qar006-lesson-flow',typename:QuantumARExplorerLeafScenario.getTypeName()},
    {id:'qar006-ik-bit-selection',typename:QuantumARExplorerReachScenario.getTypeName()},
    {id:'qar006-native-preservation',typename:QuantumARExplorerPreservationScenario.getTypeName()},
    {id:'qar009-visual-spatial-contracts',typename:QuantumARExplorerVisualScenario.getTypeName()},
    {id:'qar009-optional-gate-lab',typename:QuantumARExplorerGateScenario.getTypeName()},
    {id:'qar010-judge-experience',typename:QAR010JudgeScenario.getTypeName()}
  ];
}
