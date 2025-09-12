export default function getTemplate() {
  return `
  <cq-context class="cq-context ciq-night">
  <div class="ciq-nav">
    <div class="sidenav-toggle ciq-toggles">
      <cq-toggle
        class="ciq-sidenav"
        cq-member="sidenav"
        cq-toggles="sidenavOn,sidenavOff"
        cq-toggle-classes="active,"
        keyboard-navigation="false"
        ><span></span><cq-tooltip>More</cq-tooltip>
      </cq-toggle>
    </div>
    <cq-side-nav cq-on="sidenavOn"
      ><div class="icon-toggles ciq-toggles">
        <cq-toggle class="ciq-draw" cq-member="drawing"
          ><cq-help help-id="drawing_tools_toggle"></cq-help><span></span
          ><cq-tooltip>Draw</cq-tooltip></cq-toggle
        ><cq-info-toggle-dropdown
          ><cq-toggle class="ciq-CH" cq-member="crosshair"
            ><span></span
            ><cq-tooltip>Crosshair (Alt + \\)</cq-tooltip></cq-toggle
          ><cq-menu class="ciq-menu toggle-options collapse"
            ><span></span
            ><cq-menu-dropdown
              ><cq-item cq-member="crosshair"
                >Hide Heads-Up Display<span class="ciq-radio"
                  ><span></span></span></cq-item
                ><cq-item cq-member="headsUp-static"
                >Show Heads-Up Display<span class="ciq-radio"><span></span></span
                ></cq-item
              ></cq-menu-dropdown
            ></cq-menu
          ></cq-info-toggle-dropdown
        ><cq-info-toggle-dropdown
          ><cq-toggle class="ciq-HU" cq-member="headsUp"
            ><span></span><cq-tooltip>Info</cq-tooltip></cq-toggle
          ><cq-menu class="ciq-menu toggle-options collapse tooltip-ui"
            ><span></span
            ><cq-menu-dropdown
              ><cq-item cq-member="headsUp-dynamic"
                >Show Dynamic Callout<span class="ciq-radio"><span></span></span
              ></cq-item
              ><cq-item cq-member="headsUp-floating"
                >Show Tooltip<span class="ciq-radio"><span></span></span
              ></cq-item
            ></cq-menu-dropdown
          ></cq-menu
        ></cq-info-toggle-dropdown
        ><cq-toggle
          class="ciq-DT tableview-ui"
          cq-member="tableView"
          role="button"
          aria-pressed="false"
          ><span></span><cq-tooltip>Table View</cq-tooltip></cq-toggle
        >
      </div></cq-side-nav
    >
    <div class="ciq-menu-section">
      <div class="ciq-dropdowns">
        <cq-menu class='ciq-menu ciq-views collapse'>
          <span>Views</span>
          <cq-menu-dropdown>
            <cq-views></cq-views>
          </cq-menu-dropdown>
        </cq-menu>
        <cq-menu class='ciq-menu ciq-studies collapse' cq-focus='input'>
          <span>Studies</span>
          <cq-menu-dropdown>
            <cq-study-menu-manager></cq-study-menu-manager>
          </cq-menu-dropdown>
        </cq-menu>
        <cq-menu class="ciq-menu ciq-preferences collapse"
          ><span></span
          ><cq-menu-dropdown
            ><cq-menu-dropdown-section class="chart-preferences"
              ><cq-heading>Chart Preferences</cq-heading
              ><cq-menu-container
                cq-name="menuChartPreferences"
              ></cq-menu-container
              ><cq-separator></cq-separator></cq-menu-dropdown-section
            ><cq-menu-dropdown-section class="y-axis-preferences"
              ><cq-heading>Y-Axis Preferences</cq-heading
              ><cq-menu-container
                cq-name="menuYAxisPreferences"
              ></cq-menu-container
              ><cq-separator></cq-separator></cq-menu-dropdown-section
            ><cq-menu-dropdown-section class="chart-addons"
              ><cq-heading>Additional Features</cq-heading
              ><cq-menu-container cq-name="menuAddOns"></cq-menu-container
              ><cq-separator></cq-separator></cq-menu-dropdown-section
            ></cq-menu-dropdown
          >
        </cq-menu>
      </div>
    </div>
  </div>
  <div class="ciq-chart-area">
    <div class="ciq-chart">
      <cq-message-toaster
      ></cq-message-toaster
      ><cq-palette-dock
        ><div class="palette-dock-container"
        ><cq-drawing-settings
          class="palette-settings"
        ></cq-drawing-settings>
        <cq-drawing-palette
          docked="true"
          orientation="vertical"
        ></cq-drawing-palette
        ></div
      ></cq-palette-dock>
      <div class="chartContainer"></div>
    </div>
  </div>
</cq-context>
`;
}
