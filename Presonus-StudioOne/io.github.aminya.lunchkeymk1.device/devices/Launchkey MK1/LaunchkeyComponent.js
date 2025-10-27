// @ts-check

// @ts-ignore
include_file("resource://com.presonus.musicdevices/sdk/controlsurfacecomponent.js");
// @ts-ignore
include_file("resource://com.presonus.musicdevices/sdk/musicprotocol.js");
// @ts-ignore
include_file("LaunchkeyProtocol.js");

const PadSectionMode = {};
PadSectionMode[PadSectionMode.kNone = 0] = "kNone";
PadSectionMode[PadSectionMode.kLauncher = 1] = "kLauncher";
PadSectionMode[PadSectionMode["kModeMin"] = 0] = "kModeMin";
PadSectionMode[PadSectionMode.kModeMax = 1] = "kModeMax";


/**
 * @type {typeof import("presonus_studioone_5_sdk/src/controlsurfacecomponent.ts").PreSonus["ControlSurfaceComponent"]}
 */
// @ts-ignore
const ControlSurfaceComponent = PreSonus.ControlSurfaceComponent;
/**
 * @type {typeof import("presonus_studioone_5_sdk/src/controlsurfacecomponent.ts").PreSonus["PadSectionRole"] & { kLauncherInput: string }}
 */
// @ts-ignore
const PadSectionRole = PreSonus.PadSectionRole;
/**
 * @type { { kCombined: number }}
 */
// @ts-ignore
const PadSectionLauncherMode = PreSonus.PadSectionLauncherMode;

class LaunchkeyComponent extends ControlSurfaceComponent {
    onInit(hostComponent) {
        super.onInit(hostComponent);
        this.debugLog = false;
        this.model = hostComponent.model;

        const root = this.model.root;
        const colorMapper = root.findColorTable("DAWModeColors");
        if (colorMapper) {
            LaunchkeyProtocol.kPadColors.forEach((tableColor) => {
                colorMapper.addColor(tableColor);
            });
        }

        const paramList = hostComponent.paramList;
        this.padSectionMode = paramList.addInteger(PadSectionMode.kModeMin, PadSectionMode.kModeMax, "padSectionMode");

        // Launchkey-specific color parameters
        this.whiteColorParam = paramList.addColor("whiteColor");
        this.whiteColorParam.fromString("#FFFFFF");
        this.redColorParam = paramList.addColor("redColor");
        this.redColorParam.fromString("#FF0000");
        this.greenColorParam = paramList.addColor("greenColor");
        this.greenColorParam.fromString("#00FF00");
        this.amberColorParam = paramList.addColor("amberColor");
        this.amberColorParam.fromString("#FF8000");
        this.yellowColorParam = paramList.addColor("yellowColor");
        this.yellowColorParam.fromString("#FFFF00");
        this.blueColorParam = paramList.addColor("blueColor");
        this.blueColorParam.fromString("#0000FF");
        this.magentaColorParam = paramList.addColor("magentaColor");
        this.magentaColorParam.fromString("#FF00FF");

        this.padSection = root.find("PadSectionElement");
        const c = this.padSection.component;
        c.addNullHandler();
        c.addHandlerForRole(PadSectionRole.kLauncherInput);

        const launcherInputHandler = this.padSection.component.getHandler(PadSectionMode.kLauncher);
        launcherInputHandler.setMappingMode(PadSectionLauncherMode.kCombined);
        this.launcherHandler = launcherInputHandler;

        this.updatePadSectionMode(PadSectionMode.kNone);
    }

    paramChanged(param) {
        if (param == this.padSectionMode) {
            this.updatePadSectionMode(param.value);
        }
        else {
            super.paramChanged(param);
        }
    }

    onExit() {
        super.onExit();
    }

    onSuspend(state) {
        if (state && this.padSectionMode.value == PadSectionMode.kLauncher)
            this.padSectionMode.setValue(PadSectionMode.kNone, true);
    }
    updatePadSectionMode(mode) {
        this.padSection.component.setActiveHandler(mode);
    }
}

LaunchkeyComponent.kSceneButtonCount = 8;
LaunchkeyComponent.kNavButtonCount = 0;
LaunchkeyComponent.kMuteSoloButtonIndex = 0;

class LaunchkeyMK1Component extends LaunchkeyComponent {
    onInit(hostComponent) {
        super.onInit(hostComponent);

        // Launchkey MK1 specific initialization
        const paramList = hostComponent.paramList;
        this.inControlMode = paramList.addParam("inControlMode");
        this.inControlMode.setSignalAlways(true);
    }

    paramChanged(param) {
        if (param == this.inControlMode) {
            // Handle InControl mode changes
            this.updateInControlMode(param.value);
        }
        else {
            super.paramChanged(param);
        }
    }

    updateInControlMode(enabled) {
        // Update InControl mode state
        if (this.debugLog) {
            console.log(`Launchkey MK1 InControl mode: ${enabled ? 'enabled' : 'disabled'}`);
        }
    }
}

function createLaunchkeyMK1ComponentInstance() {
    return new LaunchkeyMK1Component();
}
