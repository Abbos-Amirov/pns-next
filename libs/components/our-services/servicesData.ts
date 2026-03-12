import AddIcon from '@mui/icons-material/Add';
import DoorFrontIcon from '@mui/icons-material/DoorFront';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BuildIcon from '@mui/icons-material/Build';
import StraightenIcon from '@mui/icons-material/Straighten';
import StyleIcon from '@mui/icons-material/Style';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewDayIcon from '@mui/icons-material/ViewDay';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import HandymanIcon from '@mui/icons-material/Handyman';
import type { SvgIconComponent } from '@mui/icons-material';

export type ServiceId =
	| 'new-window'
	| 'new-door'
	| 'window-replacement'
	| 'door-replacement'
	| 'repair-maintenance'
	| 'measurement'
	| 'glass-replacement'
	| 'frame-repair'
	| 'sliding-door'
	| 'after-support';

export interface ServiceItem {
	id: ServiceId;
	titleKey: string;
	descKey: string;
	Icon: SvgIconComponent;
}

export const SERVICES_DATA: ServiceItem[] = [
	{ id: 'new-window', titleKey: 'ServiceNewWindow', descKey: 'ServiceNewWindowDesc', Icon: AddIcon },
	{ id: 'new-door', titleKey: 'ServiceNewDoor', descKey: 'ServiceNewDoorDesc', Icon: DoorFrontIcon },
	{ id: 'window-replacement', titleKey: 'ServiceWindowReplacement', descKey: 'ServiceWindowReplacementDesc', Icon: SwapHorizIcon },
	{ id: 'door-replacement', titleKey: 'ServiceDoorReplacement', descKey: 'ServiceDoorReplacementDesc', Icon: SwapHorizIcon },
	{ id: 'repair-maintenance', titleKey: 'ServiceRepairMaintenance', descKey: 'ServiceRepairMaintenanceDesc', Icon: HandymanIcon },
	{ id: 'measurement', titleKey: 'ServiceMeasurement', descKey: 'ServiceMeasurementDesc', Icon: StraightenIcon },
	{ id: 'glass-replacement', titleKey: 'ServiceGlassReplacement', descKey: 'ServiceGlassReplacementDesc', Icon: StyleIcon },
	{ id: 'frame-repair', titleKey: 'ServiceFrameRepair', descKey: 'ServiceFrameRepairDesc', Icon: BuildIcon },
	{ id: 'sliding-door', titleKey: 'ServiceSlidingDoor', descKey: 'ServiceSlidingDoorDesc', Icon: ViewDayIcon },
	{ id: 'after-support', titleKey: 'ServiceAfterSupport', descKey: 'ServiceAfterSupportDesc', Icon: SupportAgentIcon },
];
