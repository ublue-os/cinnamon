const Lang = imports.lang;
const St = imports.gi.St;
const Clutter = imports.gi.Clutter;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;

const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Util = imports.misc.util;
const SignalManager = imports.misc.signalManager;


// const ModalDialog = imports.ui.modalDialog;
// const Settings = imports.ui.settings;
// const PopupMenu = imports.ui.popupMenu;
// const Mainloop = imports.mainloop;
// const Pango = imports.gi.Pango;


// class WorkspaceButton {
//     constructor(index, applet) {
//         this.index = index;
//         this.applet = applet;
//         this.workspace = global.workspace_manager.get_workspace_by_index(this.index);
//         this.actor = null; // defined in subclass

//         this.ws_signals = new SignalManager.SignalManager(null);

//         this.ws_signals.connect(this.workspace, "window-added", this.update, this);
//         this.ws_signals.connect(this.workspace, "window-removed", this.update, this);
//     }

//     show() {
//         this.actor.connect('button-release-event', Lang.bind(this, this.onClicked));
//         // this._tooltip = new Tooltips.PanelItemTooltip(this, this.workspace_name, this.applet.orientation);
//         if (this.index === global.workspace_manager.get_active_workspace_index()) {
//             this.activate(true);
//         }
//     }

//     onClicked(actor, event) {
//         global.log("Click!");
//         if (event.get_button() == 1) {
//             Main.wm.moveToWorkspace(this.workspace);
//         }
//     }

//     update() {
//         // defined in subclass
//     }

//     activate(active) {
//         // Defined in subclass
//     }

//     destroy() {
//         this.ws_signals.disconnectAllSignals();
//         this.actor.destroy();
//     }
// }

// class WorkspaceGraph extends WorkspaceButton {
//     constructor(index, applet, width, height) {
//         super(index, applet);

//         this.scaleFactor = 0;

//         this.actor = new St.Bin({ reactive: applet._draggable.inhibit,
//                                   style_class: 'workspace',
//                                   y_fill: true,
//                                   important: true });

//         this.graphArea = new St.DrawingArea({ style_class: 'windows', important: true });
//         this.actor.add_actor(this.graphArea);
//         this.panelApplet = applet;

//         this.graphArea.set_size(width, height);
//         this.graphArea.connect('repaint', Lang.bind(this, this.onRepaint));
//     }

//     scale (windows_rect, workspace_rect) {
//         let scaled_rect = new Meta.Rectangle();
//         scaled_rect.x = Math.round((windows_rect.x - workspace_rect.x) / this.scaleFactor);
//         scaled_rect.y = Math.round((windows_rect.y - workspace_rect.y) / this.scaleFactor);
//         scaled_rect.width = Math.round(windows_rect.width / this.scaleFactor);
//         scaled_rect.height = Math.round(windows_rect.height / this.scaleFactor);
//         return scaled_rect;
//     }

//     sortWindowsByUserTime (win1, win2) {
//         let t1 = win1.get_user_time();
//         let t2 = win2.get_user_time();
//         return (t2 < t1) ? 1 : -1;
//     }

//     paintWindow(metaWindow, themeNode, cr) {
//         let windowBackgroundColor;
//         let windowBorderColor;

//         let scaled_rect = this.scale(metaWindow.get_buffer_rect(), this.workspace_size);

//         if (metaWindow.has_focus()) {
//             windowBorderColor = themeNode.get_color('-active-window-border');
//             windowBackgroundColor = themeNode.get_color('-active-window-background');
//         } else {
//             windowBorderColor = themeNode.get_color('-inactive-window-border');
//             windowBackgroundColor = themeNode.get_color('-inactive-window-background');
//         }

//         Clutter.cairo_set_source_color(cr, windowBorderColor);
//         cr.rectangle(scaled_rect.x, scaled_rect.y, scaled_rect.width, scaled_rect.height);
//         cr.strokePreserve();

//         Clutter.cairo_set_source_color(cr, windowBackgroundColor);
//         cr.fill();
//     }

//     onRepaint(area) {
//         // we need to set the size of the drawing area the first time, but we can't get
//         // accurate measurements until everything is added to the stage
//         // if (this.scaleFactor === 0) this.setGraphSize();
//         let graphThemeNode = this.graphArea.get_theme_node();
//         let cr = area.get_context();
//         cr.setLineWidth(1);

//         // construct a list with all windows
//         let windows = this.workspace.list_windows();
//         windows = windows.filter( Main.isInteresting );
//         windows = windows.filter(
//             function(w) {
//                 return !w.is_skip_taskbar() && !w.minimized;
//             });

//         windows.sort(this.sortWindowsByUserTime);

//         if (windows.length) {
//             let focusWindow = null;

//             for (let i = 0; i < windows.length; ++i) {
//                 let metaWindow = windows[i];

//                 if (metaWindow.has_focus()) {
//                     focusWindow = metaWindow;
//                     continue;
//                 }

//                 this.paintWindow(metaWindow, graphThemeNode, cr);
//             }
//             try {
//                 if (focusWindow) {
//                     this.paintWindow(focusWindow, graphThemeNode, cr);
//                 }
//             }
//             catch (e) {
//                 global.log("Error: " + e.toString());
//             }
//         }
//         cr.$dispose();
//     }

//     update() {
//         this.graphArea.queue_repaint();
//     }

//     activate(active) {
//         if (active)
//             this.actor.add_style_pseudo_class('active');
//         else
//             this.actor.remove_style_pseudo_class('active');
//     }
// }

const core_path = "/home/andrew/homes/";

function get_gicon(assignment) {
    let path = '';
    if (assignment == '')
        path = core_path + 'icon.png'
    else
        path = core_path + assignment + '/icon.png';

    return new Gio.FileIcon({ file: Gio.file_new_for_path(path)});
}

function GridStyle(applet, cols, rows, height) {
    this._init(applet, cols, rows, height);
}

GridStyle.prototype = {

    _init: function (applet, cols, rows, panel_height) {
        this.scrollby = 'col';
        this.applet = applet;
        global.log("B3 APPLET: " + applet.toString());
        global.log("B3 APPLET ACTOR: " + applet.actor.toString());
        this.button = [];
        this.sample_workspace = global.workspace_manager.get_workspace_by_index(0);
        this.workspace_size = this.sample_workspace.get_work_area_all_monitors();
        this.assignments = [];

        this.update_grid(cols, rows, panel_height);
        this.event_handlers = [];
        this.switch_id = global.window_manager.connect('switch-workspace', Lang.bind(this, this.update));
        this.scroll_id = this.applet.actor.connect('scroll-event', Lang.bind(this, this.onMouseScroll));
        this.timeout_id = null;
    },

    cleanup: function () {
        global.window_manager.disconnect(this.switch_id);
        this.applet.actor.disconnect(this.scroll_id);
    },

    update_grid: function (cols, rows, panel_height) {
        this.cols = cols;
        this.rows = rows;
        this.panel_height = panel_height;
        this.rebuild();
    },

    onMouseScroll: function (actor, event) {
        if (this.scrollby == 'row')
            this.scrollByRow(event);
        else
            this.scrollByCol(event);
    },

    scrollByCol: function (event) {
        var idx = global.workspace_manager.get_active_workspace_index();

        if (event.get_scroll_direction() == 0) idx--;
        else if (event.get_scroll_direction() == 1) idx++;

        if (global.workspace_manager.get_workspace_by_index(idx) != null)
            global.workspace_manager.get_workspace_by_index(idx).activate(global.get_current_time());
    },

    scrollByRow: function (event) {
        var idx = global.workspace_manager.get_active_workspace_index();
        var numworkspaces = this.rows * this.cols;

        var row = Math.floor(idx / this.cols);
        var col = idx % this.cols;

        if (event.get_scroll_direction() == 0) {
            row--;
            if (row < 0) {
                row = this.rows - 1;
                col--;
            }
        }
        else if (event.get_scroll_direction() == 1) {
            row++;
            if (row >= this.rows) {
                row = 0;
                col++;
            }
        }

        if (col < 0 || col >= this.cols)
            return;

        idx = row * this.cols + col;

        if (global.workspace_manager.get_workspace_by_index(idx) != null)
            global.workspace_manager.get_workspace_by_index(idx).activate(global.get_current_time());
    },

    getSubdirectories: function (path) {
        //Returns a sorted list of strings representing the subdirectories found
        //at path. Inserts "", representing the parent directory, at the front of the list.
        // const directory = GLib.build_filenamev([path]);
        const directory = Gio.file_new_for_path(path);
        let dirs = [""];
        let fileEnum = null;
        try {
            fileEnum = directory.enumerate_children('standard::name,standard::type',
                                                    Gio.FileQueryInfoFlags.NONE, null);
        } catch (e) {
            fileEnum = null;
        }
        if (fileEnum != null) {
            let info;
            while ((info = fileEnum.next_file(null))) {
                if (info.get_file_type() === Gio.FileType.DIRECTORY) {
                    dirs.push(info.get_name());
                }
            }
        }
        return dirs.sort();
    },

    onWorkspaceButtonClicked: function (actor, event) {
        if (event.get_button() != 1) return false;
        global.workspace_manager.get_workspace_by_index(actor.index).activate(global.get_current_time());
    },

    onIconClicked: function (actor, event) {
        //When the user clicks on an icon, use its index to get its assignment.
        //Then inspect the subdirectories at core_path, which provide a list of possible assignments.
        //Update this icon to use the option on that list, and update the workspaces file that 
        //records the current values.
        if (event.get_button() != 1) return false;
        let dirs = this.getSubdirectories(core_path);
        let assignment = this.assignments[actor.index];
        let i = dirs.indexOf(assignment);
        i = (i + 1) % dirs.length;
        this.assignments[actor.index] = dirs[i];
        actor.gicon = get_gicon(dirs[i]);
        GLib.file_set_contents(core_path + "workspaces",this.assignments.toString());
    },    

    setReactivity: function (reactive) {
        for (let i = 0; i < this.button.length; ++i)
            this.button[i].reactive = reactive;
    },

    scale: function (windows_rect, workspace_rect) {
        let scaled_rect = new Meta.Rectangle();
        scaled_rect.x = Math.round((windows_rect.x - workspace_rect.x) / this.scaleFactor);
        scaled_rect.y = Math.round((windows_rect.y - workspace_rect.y) / this.scaleFactor);
        scaled_rect.width = Math.round(windows_rect.width / this.scaleFactor);
        scaled_rect.height = Math.round(windows_rect.height / this.scaleFactor);
        return scaled_rect;
    },

    sortWindowsByUserTime: function (win1, win2) {
        let t1 = win1.get_user_time();
        let t2 = win2.get_user_time();
        return (t2 < t1) ? 1 : -1;
    },

    paintWindow: function (metaWindow, themeNode, cr) {
        let windowBackgroundColor;
        let windowBorderColor;

        let scaled_rect = this.scale(metaWindow.get_buffer_rect(), this.workspace_size);

        if (metaWindow.has_focus()) {
            windowBorderColor = themeNode.get_color('-active-window-border');
            windowBackgroundColor = themeNode.get_color('-active-window-background');
            // cr.setSourceRGBA(0.5, 0.5, 0.5, 1);
        } else {
            windowBorderColor = themeNode.get_color('-inactive-window-border');
            windowBackgroundColor = themeNode.get_color('-inactive-window-background');
            // cr.setSourceRGBA(0.25, 0.25, 0.25, 1);
        }
        Clutter.cairo_set_source_color(cr, windowBorderColor);
        cr.rectangle(scaled_rect.x, scaled_rect.y, scaled_rect.width, scaled_rect.height);
        cr.strokePreserve();

        Clutter.cairo_set_source_color(cr, windowBackgroundColor);
        cr.fill();
    },

    onRepaint: function (area) {
        try {
            let graphThemeNode = area.get_theme_node();
            let cr = area.get_context();
            cr.setLineWidth(1);

            // let windowBorderColor = graphThemeNode.get_color('-active-window-border');
            // let windowBackgroundColor = graphThemeNode.get_color('-active-window-background');
            // // global.log("Color (RG): " + windowBackgroundColor.red.toString() + " " + windowBorderColor.green.toString());
            // Clutter.cairo_set_source_color(cr, windowBorderColor);
            // cr.rectangle(0,0,40,40);
            // cr.strokePreserve();

            // Clutter.cairo_set_source_color(cr, windowBackgroundColor);
            // cr.fill();
            // construct a list with all windows
            let workspace = global.workspace_manager.get_workspace_by_index(area.index);
            let windows = workspace.list_windows();
            windows = windows.filter( Main.isInteresting );
            windows = windows.filter(
                function(w) {
                    return !w.is_skip_taskbar() && !w.minimized;
                });

            windows.sort(this.sortWindowsByUserTime);

            if (windows.length) {
                let focusWindow = null;

                for (let i = 0; i < windows.length; ++i) {
                    // global.log("Paint window.");
                    let metaWindow = windows[i];

                    if (metaWindow.has_focus()) {
                        focusWindow = metaWindow;
                        continue;
                    }
                    
                    this.paintWindow(metaWindow, graphThemeNode, cr);
                }

                if (focusWindow) {
                    this.paintWindow(focusWindow, graphThemeNode, cr);
                }
            }

            cr.$dispose();

        }
        catch (e) {
            global.log ("Error: " + e.toString());
        }
    },

    getSizeAdjustment: function (actor, vertical) {
        let themeNode = actor.get_theme_node();

        if (vertical) {
            return themeNode.get_horizontal_padding() +
                themeNode.get_border_width(St.Side.LEFT) +
                themeNode.get_border_width(St.Side.RIGHT);
        }
        else {
            return themeNode.get_vertical_padding() +
                themeNode.get_border_width(St.Side.TOP) +
                themeNode.get_border_width(St.Side.BOTTOM);
        }
    },

    rebuild: function () {
        this.applet.actor.destroy_all_children();
        // this.table = new St.Table({ homogeneous: false, reactive: true });
        // this.applet.actor.add(this.table);
        this.table = this.applet.actor;
        // const grid = this.applet.actor;
        // grid.hide();
        // grid.remove_all_children();
        // const gridLayout = grid.layout_manager;

        let fileContents = String(GLib.file_get_contents("/home/andrew/homes/workspaces")[1]);
        fileContents = fileContents.trim();
        this.assignments = fileContents.split(",");

        // let dir = GLib.dir_open("/home/andrew/homes/");
        // global.log(GLib.dir_read_name(dir));
        // global.log(GLib.dir_read_name(dir));
        // GLib.dir_close(dir);
        global.log(this.assignments.toString());
        global.log(this.getSubdirectories("/home/andrew/homes"));

        let bin = new St.Bin({ reactive: this.applet._draggable.inhibit,
            style_class: 'workspace',
            y_fill: true,
            important: true });

        // global.log("Applet: " + this.applet.toString());
        // global.log("Applet actor: " + this.applet.actor.toString());
        // global.log("Applet actor thing: " + this.getSizeAdjustment(this.applet.actor, false))
        // global.log("Bin: " + this.getSizeAdjustment(bin, true));
        // global.log("Table: " + this.getSizeAdjustment(this.table, true));

        let node = new St.DrawingArea({ style_class: 'windows', important: true }).get_theme_node();
        // let btn_height = this.height / this.rows - (node.get_vertical_padding() +
        //                     node.get_border_width(St.Side.TOP) + node.get_border_width(St.Side.BOTTOM));
        // let btn_height = (this.panel_height - this.getSizeAdjustment(this.table,true)) / this.rows -
        //                 this.getSizeAdjustment(bin, true);
        // let btn_height = (this.panel_height) / this.rows -
        //                 this.getSizeAdjustment(bin, false);                        
        let btn_height = (this.panel_height - 10) / (this.rows + 1);
        this.scaleFactor = this.workspace_size.height / btn_height;
        let btn_width = this.workspace_size.width / this.scaleFactor;
        this.button = [];
        this.graphArea = [];
        // this.icon = [];
        this.ws_signals = new SignalManager.SignalManager(null);

        this._focusWindow = null;
        if (global.display.focus_window)
            this._focusWindow = global.display.focus_window;

        for (let c = 0; c < this.cols; c++) {
            // Select the appropriate icon, according to the current workspace assignments
            let new_gicon = get_gicon(this.assignments[c]);
            let icon = new St.Icon({ gicon: new_gicon, icon_size: btn_height, reactive: this.applet._draggable.inhibit, important: true });
            icon.index = c;
            icon.connect('button-release-event', Lang.bind(this, this.onIconClicked));
            this.table.add(icon, { row: 0, col: c });
            
            for (let r = 0; r < this.rows; r++) {
                let i = (r * this.cols) + c;
                // this.button[i] = new St.Bin({ name: 'workspaceButton', style_class: 'workspace-button', reactive: true });
                let workspace = global.workspace_manager.get_workspace_by_index(i);
                this.button[i] = new St.Bin({ reactive: this.applet._draggable.inhibit,
                                            style_class: 'workspace',
                                            // y_fill: true,
                                            important: true });
                this.button[i].index = i;
                // this.button[i].set_height(btn_height);
                // this.button[i].set_width(btn_width); // (btn_height * 1.25);
                this.button[i].connect('button-release-event', Lang.bind(this, this.onWorkspaceButtonClicked));
                
                this.graphArea[i] = new St.DrawingArea({ style_class: 'windows', important: true });
                this.graphArea[i].index = i;
                this.graphArea[i].set_size(btn_width, btn_height);
                // global.log("B Actor: " + this.getSizeAdjustment(this.button[i], false).toString()
                //         + " " + this.button[i].toString()); 
                // global.log(this.graphArea[i].get_surface_size().toString());
                this.graphArea[i].connect('repaint', Lang.bind(this, this.onRepaint));
                this.ws_signals.connect(workspace, "window-added", this.graphArea[i].queue_repaint, this.graphArea[i]);
                this.ws_signals.connect(workspace, "window-removed", this.graphArea[i].queue_repaint, this.graphArea[i]);

                // this.button[i].set_child(this.graphArea[i]);
                this.button[i].add_actor(this.graphArea[i]);               
                
                // gridLayout.attach(this.button[i], c, r, 1, 1);
                this.table.add(this.button[i], { row: r + 1, col: c });
                }
        }

        global.log("B Panel Actor: " + this.getSizeAdjustment(this.applet.actor, false).toString()
                        + " " +this.applet.actor.toString()); 
        global.log("B Actor: " + this.getSizeAdjustment(this.button[0], false).toString()
                        + " " + this.button[0].toString()); 
        
        
        this.update();

        this.ws_signals.connect(global.display, "notify::focus-window", this._onFocusChanged, this);
        this._onFocusChanged();
    },

    update: function () {
        let active_ws = global.workspace_manager.get_active_workspace_index();

        for (let i = 0; i < this.button.length; ++i) {
            if (i == active_ws)
                // this.button[i].add_style_pseudo_class('outlined');
                this.button[i].add_style_pseudo_class('active');
            else
                // this.button[i].remove_style_pseudo_class('outlined');
                this.button[i].remove_style_pseudo_class('active');
        }
    },

    _onFocusChanged: function () {
        if (global.display.focus_window &&
            this._focusWindow == global.display.focus_window)
            return;

        this.ws_signals.disconnect("position-changed");
        this.ws_signals.disconnect("size-changed");

        
        this._focusWindow = global.display.focus_window;
        this.ws_signals.connect(this._focusWindow, "position-changed", Lang.bind(this, this._onPositionChanged), this);
        this.ws_signals.connect(this._focusWindow, "size-changed", Lang.bind(this, this._onPositionChanged), this);
        this._repaintActiveWorkspace();


    if (!global.display.focus_window)
        return;
    },

    _repaintActiveWorkspace: function () {
        let graphArea = this.graphArea[global.workspace_manager.get_active_workspace_index()];
        graphArea.queue_repaint();
        this.timeout_id = null;
    },

    _onPositionChanged: function () {
        Util.clearTimeout(this.timeout_id);
        this.timeout_id = Util.setTimeout(() => this._repaintActiveWorkspace(),100);
    },    
};

