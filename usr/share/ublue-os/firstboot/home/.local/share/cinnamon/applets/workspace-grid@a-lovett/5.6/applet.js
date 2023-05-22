/*
 * This application is released under the GNU General Public License v2. A full
 * copy of the license can be found here: http://www.gnu.org/licenses/gpl.txt
 * Thank you for using free software!
 *
 * Cinnamon 2D Workspace Grid (c) Jason J. Herne <hernejj@gmail.com> 2022
 */

// Workspace manager: https://github.com/linuxmint/muffin/blob/master/src/core/meta-workspace-manager.c
// GObject.Object: https://lazka.github.io/pgi-docs/GObject-2.0/classes/Object.html#GObject.Object.list_properties



const St = imports.gi.St;
const Lang = imports.lang;
const Applet = imports.ui.applet;
const Settings = imports.ui.settings;
const Clutter = imports.gi.Clutter;
const Meta = imports.gi.Meta;
const Main = imports.ui.main;
const GObject = imports.gi.GObject;
let WorkspaceController, BarIndicatorStyle, GridStyle;
let total_rows = 2;
let total_cols = 3;

if (typeof require !== 'undefined') {
    WorkspaceController = require('WorkspaceController');
    BarIndicatorStyle = require('BarIndicatorStyle');
    GridStyle = require('GridStyle');
} else {
    const AppletDir = imports.ui.appletManager.applets['workspace-grid@a-lovett'];
    WorkspaceController = AppletDir.WorkspaceController;
    BarIndicatorStyle = AppletDir.BarIndicatorStyle;
    GridStyle = AppletDir.GridStyle;
}

function registerKeyBindings(registerUpDownKeyBindings) {
    try {
        if (registerUpDownKeyBindings) {
            Meta.keybindings_set_custom_handler('switch-to-workspace-up', switchWorkspaceUp);
            Meta.keybindings_set_custom_handler('switch-to-workspace-down', switchWorkspaceDown);
        }
        else {
            Meta.keybindings_set_custom_handler('switch-to-workspace-up', (d, w, b) => Main.wm._showWorkspaceSwitcher(d, w, b));
            Meta.keybindings_set_custom_handler('switch-to-workspace-down', (d, w, b) => Main.wm._showWorkspaceSwitcher(d, w, b));
        }
        Meta.keybindings_set_custom_handler('switch-to-workspace-left', switchWorkspaceLeft);
        Meta.keybindings_set_custom_handler('switch-to-workspace-right', switchWorkspaceRight);
    }
    catch (e) {
        global.log("workspace-grid@a-lovett: Registering keybindings failed!");
        global.logError("workspace-grid@a-lovett exception: " + e.toString());
    }
}

function deregisterKeyBindings() {
    Meta.keybindings_set_custom_handler('switch-to-workspace-up', (d, w, b) => Main.wm._showWorkspaceSwitcher(d, w, b));
    Meta.keybindings_set_custom_handler('switch-to-workspace-down', (d, w, b) => Main.wm._showWorkspaceSwitcher(d, w, b));
    Meta.keybindings_set_custom_handler('switch-to-workspace-left', (d, w, b) => Main.wm._showWorkspaceSwitcher(d, w, b));
    Meta.keybindings_set_custom_handler('switch-to-workspace-right', (d, w, b) => Main.wm._showWorkspaceSwitcher(d, w, b));
}

function switchWorkspaceUp(display, screen, window) {
    let current_index = global.workspace_manager.get_active_workspace_index();

    try {
        const integerValue = new GObject.Value();
        integerValue.init(GObject.TYPE_INT);
        global.workspace_manager.get_property("layout-columns", integerValue);
        let cols = integerValue.get_int();
        global.workspace_manager.get_property("layout-rows", integerValue);
        let rows = integerValue.get_int();

        if (current_index < cols) {
            let target_index = current_index + cols * (rows - 1);
            let target = global.workspace_manager.get_workspace_by_index(target_index);
            Main.wm.moveToWorkspace(target);
            // global.screen.get_workspace_by_index(target_index).activate(global.get_current_time())
        }
        else {
            Main.wm.actionMoveWorkspaceUp();
        }
    }
    catch (e) {
        global.log("Unable to move up one workspace! " + e.toString())

    }

    if (current_index !== global.workspace_manager.get_active_workspace_index())
        Main.wm.showWorkspaceOSD();
}

function switchWorkspaceDown(display, screen, window) {
    let current_index = global.workspace_manager.get_active_workspace_index();

    try {
        const integerValue = new GObject.Value();
        integerValue.init(GObject.TYPE_INT);
        global.workspace_manager.get_property("layout-columns", integerValue);
        let cols = integerValue.get_int();
        global.workspace_manager.get_property("layout-rows", integerValue);
        let rows = integerValue.get_int();

        if (current_index >= (cols * (rows - 1))) {
            let target_index = current_index - cols * (rows - 1);
            let target = global.workspace_manager.get_workspace_by_index(target_index);
            Main.wm.moveToWorkspace(target);
        }
        else {
            Main.wm.actionMoveWorkspaceDown();
        }
    }
    catch (e) {
        global.log("Unable to move down one workspace! " + e.toString())

    }

    if (current_index !== global.workspace_manager.get_active_workspace_index())
        Main.wm.showWorkspaceOSD();
}



function switchWorkspaceLeft(display, screen, window) {
    let current_workspace_index = global.workspace_manager.get_active_workspace_index();

    Main.wm.actionMoveWorkspaceLeft();

    if (current_workspace_index !== global.workspace_manager.get_active_workspace_index())
        Main.wm.showWorkspaceOSD();
}

function switchWorkspaceRight(display, screen, window) {
    let current_workspace_index = global.workspace_manager.get_active_workspace_index();

    Main.wm.actionMoveWorkspaceRight();

    if (current_workspace_index !== global.workspace_manager.get_active_workspace_index())
        Main.wm.showWorkspaceOSD();
}

function MyApplet(metadata, orientation, panel_height, instanceId) {
    this._init(metadata, orientation, panel_height, instanceId);
}

MyApplet.prototype = {
    __proto__: Applet.Applet.prototype,

    _init: function (metadata, orientation, panel_height, instanceId) {
        Applet.Applet.prototype._init.call(this, orientation, panel_height, instanceId);
        this.metadata = metadata;
        this.actor = new St.Table({ homogeneous: false, reactive: true,
                                    style_class: 'workspace-graph',
                                    important: true });
        // this.actor = new Clutter.Actor({ layout_manager: new Clutter.GridLayout(),
        //                                 // style_class: 'workspace-graph',
        //                                 // important: true 
        //                             });

        try {
            global.log("workspace-grid@a-lovett: v0.9");
            // this.actor.set_style_class_name("workspace-switcher-box");
            // this.actor.set_style_class_name("workspace-graph");
            this.settings = new Settings.AppletSettings(this, "workspace-grid@a-lovett", instanceId);
            this.settings.bindProperty(Settings.BindingDirection.IN, "numCols", "numCols", this.onUpdateNumberOfWorkspaces, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "numRows", "numRows", this.onUpdateNumberOfWorkspaces, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "style", "style", this.onUpdateStyle, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "registerUpDownKeyBindings", "registerUpDownKeyBindings", this.onKeyBindingChanged, null);
            this.settings.bindProperty(Settings.BindingDirection.IN, "scrollWheelBehavior", "scrollWheelBehavior", this.onUpdateScrollWheelBehavior, null);

            this.wscon = new WorkspaceController.WorkspaceController(this.numCols, this.numRows);
            this.onUpdateStyle();

            this.onPanelEditModeChanged();
            global.settings.connect('changed::panel-edit-mode', Lang.bind(this, this.onPanelEditModeChanged));
            global.log("B APPLET: " + this.toString());
            global.log("B APPLET ACTOR: " + this.actor.toString());
        }
        catch (e) {
            global.logError("workspace-grid@a-lovett Main Applet Exception: " + e.toString());
        }
    },

    on_applet_added_to_panel: function () {
        registerKeyBindings(this.registerUpDownKeyBindings);
    },

    on_applet_removed_from_panel: function () {
        this.wscon.release_control();
        deregisterKeyBindings();
        global.log("HI");
        global.log(this.ui.toString());
        if (this.ui && this.ui.ws_signals) this.ui.ws_signals.disconnectAllSignals();
    },

    onKeyBindingChanged: function () {
        registerKeyBindings(this.registerUpDownKeyBindings);
    },

    onUpdateNumberOfWorkspaces: function () {
        this.wscon.set_workspace_grid(this.numCols, this.numRows);
        this.ui.update_grid(this.numCols, this.numRows, this._panelHeight);
        total_rows = numRows;
        total_cols = numCols;
    },

    onUpdateStyle: function () {
        if (this.ui) this.ui.cleanup();
        if (this.style == 'single-row')
            this.ui = new BarIndicatorStyle.BarIndicatorStyle(this, this.numCols, this.numRows, this._panelHeight);
        else
            this.ui = new GridStyle.GridStyle(this, this.numCols, this.numRows, this._panelHeight);
        this.onUpdateScrollWheelBehavior();
    },

    onUpdateScrollWheelBehavior: function () {
        this.ui.scrollby = this.scrollWheelBehavior;
    },

    onPanelEditModeChanged: function () {
        this.ui.setReactivity(!global.settings.get_boolean('panel-edit-mode'));
    },

    on_panel_height_changed: function () {
        this.ui.update_grid(this.numCols, this.numRows, this._panelHeight);
    },
};

function main(metadata, orientation, panel_height, instanceId) {
    let myApplet = new MyApplet(metadata, orientation, panel_height, instanceId);
    return myApplet;
}
