include_file("resource://com.presonus.musicdevices/sdk/controlsurfacecomponent.js");
include_file("resource://com.presonus.musicdevices/sdk/musicprotocol.js");
include_file("LaunchkeyProtocol.js");

var PadSectionMode;
(function (PadSectionMode) {
    PadSectionMode[PadSectionMode["kNone"] = 0] = "kNone";
    PadSectionMode[PadSectionMode["kLauncher"] = 1] = "kLauncher";
    PadSectionMode[PadSectionMode["kModeMin"] = 0] = "kModeMin";
    PadSectionMode[PadSectionMode["kModeMax"] = 1] = "kModeMax";
})(PadSectionMode || (PadSectionMode = {}));

class LaunchkeyComponent extends PreSonus.ControlSurfaceComponent {
    onInit(hostComponent) {
        super.onInit(hostComponent);
        this.debugLog = false;
        this.model = hostComponent.model;

        let root = this.model.root;
        let colorMapper = root.findColorTable("DAWModeColors");
        if (colorMapper) {
            LaunchkeyProtocol.kPadColors.forEach((tableColor) => {
                colorMapper.addColor(tableColor);
            });
        }

        let paramList = hostComponent.paramList;
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
        let c = this.padSection.component;
        c.addNullHandler();
        c.addHandlerForRole(PreSonus.PadSectionRole.kLauncherInput);

        let launcherInputHandler = this.padSection.component.getHandler(PadSectionMode.kLauncher);
        launcherInputHandler.setMappingMode(PreSonus.PadSectionLauncherMode.kCombined);
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
        let paramList = hostComponent.paramList;
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
