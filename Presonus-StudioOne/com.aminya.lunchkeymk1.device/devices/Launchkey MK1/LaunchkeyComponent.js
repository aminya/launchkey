include_file("resource://com.presonus.musicdevices/sdk/controlsurfacecomponent.js");
include_file("resource://com.presonus.musicdevices/sdk/musicprotocol.js");
include_file("LaunchkeyProtocol.js");

var LaunchkeyPadSectionMode;
(function (LaunchkeyPadSectionMode) {
    LaunchkeyPadSectionMode[LaunchkeyPadSectionMode["kNone"] = 0] = "kNone";
    LaunchkeyPadSectionMode[LaunchkeyPadSectionMode["kLauncher"] = 1] = "kLauncher";
    LaunchkeyPadSectionMode[LaunchkeyPadSectionMode["kModeMin"] = 0] = "kModeMin";
    LaunchkeyPadSectionMode[LaunchkeyPadSectionMode["kModeMax"] = 1] = "kModeMax";
})(LaunchkeyPadSectionMode || (LaunchkeyPadSectionMode = {}));

var LaunchkeyNavButtonIndex;
(function (LaunchkeyNavButtonIndex) {
    LaunchkeyNavButtonIndex[LaunchkeyNavButtonIndex["kUp"] = 0] = "kUp";
    LaunchkeyNavButtonIndex[LaunchkeyNavButtonIndex["kDown"] = 1] = "kDown";
    LaunchkeyNavButtonIndex[LaunchkeyNavButtonIndex["kLeft"] = 2] = "kLeft";
    LaunchkeyNavButtonIndex[LaunchkeyNavButtonIndex["kRight"] = 3] = "kRight";
})(LaunchkeyNavButtonIndex || (LaunchkeyNavButtonIndex = {}));

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
        this.padSectionMode = paramList.addInteger(LaunchkeyPadSectionMode.kModeMin, LaunchkeyPadSectionMode.kModeMax, "padSectionMode");
        this.stopModifier = paramList.addParam("stopModifier");
        this.laneOverlay = paramList.addParam("laneOverlay");

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

        let launcherInputHandler = this.padSection.component.getHandler(LaunchkeyPadSectionMode.kLauncher);
        launcherInputHandler.setMappingMode(PreSonus.PadSectionLauncherMode.kCombined);
        this.launcherHandler = launcherInputHandler;

        this.updatePadSectionMode(LaunchkeyPadSectionMode.kNone);
    }

    paramChanged(param) {
        if (param == this.stopModifier) {
            this.padSection.component.setModifierActive(param.value, PreSonus.PadModifier.kLauncherStop);
        }
        else if (param == this.laneOverlay) {
            this.enableLaneMappingMode(param.value);
        }
        else if (param == this.padSectionMode) {
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
        if (state && this.padSectionMode.value == LaunchkeyPadSectionMode.kLauncher)
            this.padSectionMode.setValue(LaunchkeyPadSectionMode.kNone, true);
    }

    onLauncherNavigateHome(state) {
        if (!state)
            return;
        if (!this.launcherHandler)
            return;
        this.launcherHandler.setRowOffset(0);
        this.launcherHandler.setColumnOffset(0);
    }

    onLauncherNavigateUp(state) {
        if (!state)
            return;
        if (!this.launcherHandler)
            return;
        let offset = this.launcherHandler.getRowOffset();
        this.launcherHandler.setRowOffset(offset - 1);
    }

    onLauncherNavigateDown(state) {
        if (!state)
            return;
        if (!this.launcherHandler)
            return;
        let offset = this.launcherHandler.getRowOffset();
        this.launcherHandler.setRowOffset(offset + 1);
    }

    onLauncherNavigateLeft(state) {
        if (!state)
            return;
        if (!this.launcherHandler)
            return;
        let offset = this.launcherHandler.getColumnOffset();
        this.launcherHandler.setColumnOffset(offset - 1);
    }

    onLauncherNavigateRight(state) {
        if (!state)
            return;
        if (!this.launcherHandler)
            return;
        let offset = this.launcherHandler.getColumnOffset();
        this.launcherHandler.setColumnOffset(offset + 1);
    }

    enableLaneMappingMode(state) {
        if (!this.launcherHandler)
            return;
        let mode = state ? PreSonus.PadSectionLauncherMode.kLanes : PreSonus.PadSectionLauncherMode.kCombined;
        let rowOffset = this.launcherHandler.getRowOffset();
        this.launcherHandler.setMappingMode(mode);
        this.launcherHandler.setRowOffset(rowOffset);
    }

    updatePadSectionMode(mode) {
        this.padSection.component.setActiveHandler(mode);
    }
}

LaunchkeyComponent.kSceneButtonCount = 8;
LaunchkeyComponent.kNavButtonCount = 4;
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
