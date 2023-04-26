/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import {
  t,
  validateNonEmpty,
  validateInteger,
  validateNumber,
} from "@superset-ui/core";
import {
  ControlPanelConfig,
  sections,
  sharedControls,
} from "@superset-ui/chart-controls";

const config: ControlPanelConfig = {
  /**
   * The control panel is split into two tabs: "Query" and
   * "Chart Options". The controls that define the inputs to
   * the chart data request, such as columns and metrics, usually
   * reside within "Query", while controls that affect the visual
   * appearance or functionality of the chart are under the
   * "Chart Options" section.
   *
   * There are several predefined controls that can be used.
   * Some examples:
   * - groupby: columns to group by (translated to GROUP BY statement)
   * - series: same as groupby, but single selection.
   * - metrics: multiple metrics (translated to aggregate expression)
   * - metric: sane as metrics, but single selection
   * - adhoc_filters: filters (translated to WHERE or HAVING
   *   depending on filter type)
   * - row_limit: maximum number of rows (translated to LIMIT statement)
   *
   * If a control panel has both a `series` and `groupby` control, and
   * the user has chosen `col1` as the value for the `series` control,
   * and `col2` and `col3` as values for the `groupby` control,
   * the resulting query will contain three `groupby` columns. This is because
   * we considered `series` control a `groupby` query field and its value
   * will automatically append the `groupby` field when the query is generated.
   *
   * It is also possible to define custom controls by importing the
   * necessary dependencies and overriding the default parameters, which
   * can then be placed in the `controlSetRows` section
   * of the `Query` section instead of a predefined control.
   *
   * import { validateNonEmpty } from '@superset-ui/core';
   * import {
   *   sharedControls,
   *   ControlConfig,
   *   ControlPanelConfig,
   * } from '@superset-ui/chart-controls';
   *
   * const myControl: ControlConfig<'SelectControl'> = {
   *   name: 'secondary_entity',
   *   config: {
   *     ...sharedControls.entity,
   *     type: 'SelectControl',
   *     label: t('Secondary Entity'),
   *     mapStateToProps: state => ({
   *       sharedControls.columnChoices(state.datasource)
   *       .columns.filter(c => c.groupby)
   *     })
   *     validators: [validateNonEmpty],
   *   },
   * }
   *
   * In addition to the basic drop down control, there are several predefined
   * control types (can be set via the `type` property) that can be used. Some
   * commonly used examples:
   * - SelectControl: Dropdown to select single or multiple values,
       usually columns
   * - MetricsControl: Dropdown to select metrics, triggering a modal
       to define Metric details
   * - AdhocFilterControl: Control to choose filters
   * - CheckboxControl: A checkbox for choosing true/false values
   * - SliderControl: A slider with min/max values
   * - TextControl: Control for text data
   *
   * For more control input types, check out the `incubator-superset` repo
   * and open this file: superset-frontend/src/explore/components/controls/index.js
   *
   * To ensure all controls have been filled out correctly, the following
   * validators are provided
   * by the `@superset-ui/core/lib/validator`:
   * - validateNonEmpty: must have at least one value
   * - validateInteger: must be an integer value
   * - validateNumber: must be an integer or decimal value
   */

  // For control input types, see: superset-frontend/src/explore/components/controls/index.js
  controlPanelSections: [
    sections.legacyRegularTime,
    {
      label: t("Query"),
      expanded: true,
      controlSetRows: [
        [
          {
            name: "cols",
            config: {
              ...sharedControls.groupby,
              label: t("Columns"),
              description: t("Columns to group by"),
            },
          },
        ],
        [
          {
            name: "metrics",
            config: {
              ...sharedControls.metrics,
              // it's possible to add validators to controls if
              // certain selections/types need to be enforced
              validators: [validateNonEmpty],
            },
          },
        ],
        ["adhoc_filters"],
        [
          {
            name: "row_limit",
            config: sharedControls.row_limit,
          },
        ],
      ],
    },
    {
      label: t("Map Controls"),
      expanded: true,
      controlSetRows: [
        [
          {
            name: "header_text",
            config: {
              type: "TextControl",
              default: "Openlayers Map",
              renderTrigger: true,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Header Text"),
              description: t("The text you want to see in the header"),
            },
          },
        ],
        [
          {
            name: "tile_layer_url",
            config: {
              type: "TextControl",
              default:
                "http://stamen-tiles-a.a.ssl.fastly.net/watercolor/{y}/{z}/{y}.jpg",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Tile Layer URL"),
              description: t("The URL of the tile layer you want to use"),
            },
          },
        ],
        [
          {
            name: "zoom",
            config: {
              type: "TextControl",
              default: "8",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Zoom"),
              description: t("The initial zoom level of the map"),
              validators: [validateInteger],
            },
          },
        ],
        [
          {
            name: "latitude",
            config: {
              type: "TextControl",
              default: "0",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Latitude"),
              description: t("The initial latitude of the map"),
              validators: [validateNumber],
            },
          },
        ],
        [
          {
            name: "longitude",
            config: {
              type: "TextControl",
              default: "0",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Longitude"),
              description: t("The initial longitude of the map"),
              validators: [validateNumber],
            },
          },
        ],
        [
          {
            name: "fill_color_picker",
            config: {
              type: "ColorPickerControl",
              default: "0",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Polygon Fill Color"),
              description: t("The fill color of the polygons"),
            },
          },
        ],
        [
          {
            name: "polygon_stroke_color_picker",
            config: {
              type: "ColorPickerControl",
              default: "0",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Polygon Stroke Color"),
              description: t("The stroke color of the polygons"),
            },
          },
        ],
        [
          {
            name: "polygon_stroke_width",
            config: {
              type: "TextControl",
              default: "1",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Polygon Stroke Width"),
              description: t("The width used for polygon borders"),
              validators: [validateNumber],
            },
          },
        ],
        [
          {
            name: "stroke_color_picker",
            config: {
              type: "ColorPickerControl",
              default: "0",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Line Color"),
              description: t("The color used for lines"),
            },
          },
        ],
        [
          {
            name: "stroke_width",
            config: {
              type: "TextControl",
              default: "1",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Line Width"),
              description: t("The width used for lines"),
              validators: [validateNumber],
            },
          },
        ],
        [
          {
            name: "circle_fill_color_picker",
            config: {
              type: "ColorPickerControl",
              default: "0",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Circle Fill Color"),
              description: t("The fill color of the circles used for points"),
            },
          },
        ],
        [
          {
            name: "circle_stroke_color_picker",
            config: {
              type: "ColorPickerControl",
              default: "0",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Circle Stroke Color"),
              description: t("The stroke color of the circles used for points"),
            },
          },
        ],
        [
          {
            name: "circle_radius",
            config: {
              type: "TextControl",
              default: "5",
              renderTrigger: false,
              // ^ this makes it apply instantaneously, without triggering a "run query" button
              label: t("Circle Radius"),
              description: t("The radius of the circles"),
              validators: [validateNumber],
            },
          },
        ],
      ],
    },
  ],
};

export default config;
