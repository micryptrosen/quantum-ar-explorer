import {QAR012DiscoveryScenario} from './QAR012DiscoveryScenario';
import {QAR012DiscoveryGuardScenario} from './QAR012DiscoveryGuardScenario';
import {QAR010JudgeScenario} from './QAR010JudgeScenario';
import {scenariosIndex} from 'Leaf.lspkg/Scenarios/decorator/ScenarioIndexDecorator';
import {ScenarioMetadata} from 'Leaf.lspkg/Scenarios/scenario/ScenarioMetadata';
import {QuantumARExplorerLeafScenario} from './QuantumARExplorerLeafScenario';
import {QuantumARExplorerReachScenario} from './QuantumARExplorerReachScenario';
import {QuantumARExplorerPreservationScenario} from './QuantumARExplorerPreservationScenario';
import {QuantumARExplorerVisualScenario} from './QuantumARExplorerVisualScenario';
import {QuantumARExplorerGateScenario} from './QuantumARExplorerGateScenario';
import {QAR011ComparisonScenario} from './QAR011ComparisonScenario';
import {QAR011ComparisonGuardScenario} from './QAR011ComparisonGuardScenario';
import {QAR011ComparisonReachScenario} from './QAR011ComparisonReachScenario';
@component
export class QuantumARExplorerLeafIndex extends BaseScriptComponent {
  @scenariosIndex
  static scenariosIndex:ScenarioMetadata[]=[
    {id:'qar006-lesson-flow',typename:QuantumARExplorerLeafScenario.getTypeName()},
    {id:'qar006-ik-bit-selection',typename:QuantumARExplorerReachScenario.getTypeName()},
    {id:'qar006-native-preservation',typename:QuantumARExplorerPreservationScenario.getTypeName()},
    {id:'qar009-visual-spatial-contracts',typename:QuantumARExplorerVisualScenario.getTypeName()},
    {id:'qar009-optional-gate-lab',typename:QuantumARExplorerGateScenario.getTypeName()},
    {id:'qar010-judge-experience',typename:QAR010JudgeScenario.getTypeName()},
    {id:'qar011-phase-comparison',typename:QAR011ComparisonScenario.getTypeName()},
    {id:'qar011-comparison-guards',typename:QAR011ComparisonGuardScenario.getTypeName()},
    {id:'qar011-comparison-ik',typename:QAR011ComparisonReachScenario.getTypeName()},
    {id:'qar012-discovery',typename:QAR012DiscoveryScenario.getTypeName()},
    {id:'qar012-discovery-guards-ik',typename:QAR012DiscoveryGuardScenario.getTypeName()}
  ];
}

// QAR-012 additive discovery registration.
