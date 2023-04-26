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
import React, { useState, useEffect, useRef, createRef } from "react";
import { styled } from "@superset-ui/core";
import Map from "ol/Map.js";
import GeoJSON from "ol/format/GeoJSON.js";
import TileLayer from "ol/layer/Tile.js";
import LayerGroup from "ol/layer/Group.js";
import XYZ from "ol/source/XYZ";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import { Fill, Stroke, Style, Circle as CircleStyle } from "ol/style.js";
import Circle from "ol/geom/Circle.js";
import { transform } from "ol/proj.js";
import View from "ol/View.js";

// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled

// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

const Styles = styled.div`
  :root,
  :host {
    --ol-background-color: white;
    --ol-accent-background-color: #f5f5f5;
    --ol-subtle-background-color: rgba(128, 128, 128, 0.25);
    --ol-partial-background-color: rgba(255, 255, 255, 0.75);
    --ol-foreground-color: #333333;
    --ol-subtle-foreground-color: #666666;
    --ol-brand-color: #00aaff;
  }

  .ol-box {
    box-sizing: border-box;
    border-radius: 2px;
    border: 1.5px solid var(--ol-background-color);
    background-color: var(--ol-partial-background-color);
  }

  .ol-mouse-position {
    top: 8px;
    right: 8px;
    position: absolute;
  }

  .ol-scale-line {
    background: var(--ol-partial-background-color);
    border-radius: 4px;
    bottom: 8px;
    left: 8px;
    padding: 2px;
    position: absolute;
  }

  .ol-scale-line-inner {
    border: 1px solid var(--ol-subtle-foreground-color);
    border-top: none;
    color: var(--ol-foreground-color);
    font-size: 10px;
    text-align: center;
    margin: 1px;
    will-change: contents, width;
    transition: all 0.25s;
  }

  .ol-scale-bar {
    position: absolute;
    bottom: 8px;
    left: 8px;
  }

  .ol-scale-bar-inner {
    display: flex;
  }

  .ol-scale-step-marker {
    width: 1px;
    height: 15px;
    background-color: var(--ol-foreground-color);
    float: right;
    z-index: 10;
  }

  .ol-scale-step-text {
    position: absolute;
    bottom: -5px;
    font-size: 10px;
    z-index: 11;
    color: var(--ol-foreground-color);
    text-shadow: -1.5px 0 var(--ol-partial-background-color),
      0 1.5px var(--ol-partial-background-color),
      1.5px 0 var(--ol-partial-background-color),
      0 -1.5px var(--ol-partial-background-color);
  }

  .ol-scale-text {
    position: absolute;
    font-size: 12px;
    text-align: center;
    bottom: 25px;
    color: var(--ol-foreground-color);
    text-shadow: -1.5px 0 var(--ol-partial-background-color),
      0 1.5px var(--ol-partial-background-color),
      1.5px 0 var(--ol-partial-background-color),
      0 -1.5px var(--ol-partial-background-color);
  }

  .ol-scale-singlebar {
    position: relative;
    height: 10px;
    z-index: 9;
    box-sizing: border-box;
    border: 1px solid var(--ol-foreground-color);
  }

  .ol-scale-singlebar-even {
    background-color: var(--ol-subtle-foreground-color);
  }

  .ol-scale-singlebar-odd {
    background-color: var(--ol-background-color);
  }

  .ol-unsupported {
    display: none;
  }

  .ol-viewport,
  .ol-unselectable {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  .ol-viewport canvas {
    all: unset;
  }

  .ol-selectable {
    -webkit-touch-callout: default;
    -webkit-user-select: text;
    -moz-user-select: text;
    user-select: text;
  }

  .ol-grabbing {
    cursor: -webkit-grabbing;
    cursor: -moz-grabbing;
    cursor: grabbing;
  }

  .ol-grab {
    cursor: move;
    cursor: -webkit-grab;
    cursor: -moz-grab;
    cursor: grab;
  }

  .ol-control {
    position: absolute;
    background-color: var(--ol-subtle-background-color);
    border-radius: 4px;
  }

  .ol-zoom {
    top: 0.5em;
    left: 0.5em;
  }

  .ol-rotate {
    top: 0.5em;
    right: 0.5em;
    transition: opacity 0.25s linear, visibility 0s linear;
  }

  .ol-rotate.ol-hidden {
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.25s linear, visibility 0s linear 0.25s;
  }

  .ol-zoom-extent {
    top: 4.643em;
    left: 0.5em;
  }

  .ol-full-screen {
    right: 0.5em;
    top: 0.5em;
  }

  .ol-control button {
    display: block;
    margin: 1px;
    padding: 0;
    color: var(--ol-subtle-foreground-color);
    font-weight: bold;
    text-decoration: none;
    font-size: inherit;
    text-align: center;
    height: 1.375em;
    width: 1.375em;
    line-height: 0.4em;
    background-color: var(--ol-background-color);
    border: none;
    border-radius: 2px;
  }

  .ol-control button::-moz-focus-inner {
    border: none;
    padding: 0;
  }

  .ol-zoom-extent button {
    line-height: 1.4em;
  }

  .ol-compass {
    display: block;
    font-weight: normal;
    will-change: transform;
  }

  .ol-touch .ol-control button {
    font-size: 1.5em;
  }

  .ol-touch .ol-zoom-extent {
    top: 5.5em;
  }

  .ol-control button:hover,
  .ol-control button:focus {
    text-decoration: none;
    outline: 1px solid var(--ol-subtle-foreground-color);
    color: var(--ol-foreground-color);
  }

  .ol-zoom .ol-zoom-in {
    border-radius: 2px 2px 0 0;
  }

  .ol-zoom .ol-zoom-out {
    border-radius: 0 0 2px 2px;
  }

  .ol-attribution {
    text-align: right;
    bottom: 0.5em;
    right: 0.5em;
    max-width: calc(100% - 1.3em);
    display: flex;
    flex-flow: row-reverse;
    align-items: center;
  }

  .ol-attribution a {
    color: var(--ol-subtle-foreground-color);
    text-decoration: none;
  }

  .ol-attribution ul {
    margin: 0;
    padding: 1px 0.5em;
    color: var(--ol-foreground-color);
    text-shadow: 0 0 2px var(--ol-background-color);
    font-size: 12px;
  }

  .ol-attribution li {
    display: inline;
    list-style: none;
  }

  .ol-attribution li:not(:last-child):after {
    content: " ";
  }

  .ol-attribution img {
    max-height: 2em;
    max-width: inherit;
    vertical-align: middle;
  }

  .ol-attribution button {
    flex-shrink: 0;
  }

  .ol-attribution.ol-collapsed ul {
    display: none;
  }

  .ol-attribution:not(.ol-collapsed) {
    background: var(--ol-partial-background-color);
  }

  .ol-attribution.ol-uncollapsible {
    bottom: 0;
    right: 0;
    border-radius: 4px 0 0;
  }

  .ol-attribution.ol-uncollapsible img {
    margin-top: -0.2em;
    max-height: 1.6em;
  }

  .ol-attribution.ol-uncollapsible button {
    display: none;
  }

  .ol-zoomslider {
    top: 4.5em;
    left: 0.5em;
    height: 200px;
  }

  .ol-zoomslider button {
    position: relative;
    height: 10px;
  }

  .ol-touch .ol-zoomslider {
    top: 5.5em;
  }

  .ol-overviewmap {
    left: 0.5em;
    bottom: 0.5em;
  }

  .ol-overviewmap.ol-uncollapsible {
    bottom: 0;
    left: 0;
    border-radius: 0 4px 0 0;
  }

  .ol-overviewmap .ol-overviewmap-map,
  .ol-overviewmap button {
    display: block;
  }

  .ol-overviewmap .ol-overviewmap-map {
    border: 1px solid var(--ol-subtle-foreground-color);
    height: 150px;
    width: 150px;
  }

  .ol-overviewmap:not(.ol-collapsed) button {
    bottom: 0;
    left: 0;
    position: absolute;
  }

  .ol-overviewmap.ol-collapsed .ol-overviewmap-map,
  .ol-overviewmap.ol-uncollapsible button {
    display: none;
  }

  .ol-overviewmap:not(.ol-collapsed) {
    background: var(--ol-subtle-background-color);
  }

  .ol-overviewmap-box {
    border: 1.5px dotted var(--ol-subtle-foreground-color);
  }

  .ol-overviewmap .ol-overviewmap-box:hover {
    cursor: move;
  }

  border-radius: ${({ theme }) => theme.gridUnit * 2}px;
  height: ${({ height }) => height}px;
  width: ${({ width }) => width}px;

  h3 {
    /* You can use your props to control CSS! */
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.gridUnit * 3}px;
    font-size: ${({ theme, headerFontSize }) =>
      theme.typography.sizes[headerFontSize]}px;
    font-weight: ${({ theme, boldText }) =>
      theme.typography.weights[boldText ? "bold" : "normal"]};
  }

  pre {
    height: ${({ theme, headerFontSize, height }) =>
      height - theme.gridUnit * 12 - theme.typography.sizes[headerFontSize]}px;
  }

  .map-container {
    height: 100%;
    width: 100%;
    background-color: #ffffff;
  }
`;

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

const reader = new GeoJSON({
  defaultDataProjection: "EPSG:3857",
  Projection: "EPSG:3857",
});

function testIfGeoJSON(data) {
  try {
    const geojson = reader.readFeatures(data);
    return geojson.length > 0;
  } catch (e) {
    return false;
  }
}

export default function SupersetPluginChartOpenlayers(props) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  const { data, height, width, tileLayerUrl, zoom, longitude, latitude } =
    props;

  const rootElem = createRef();
  const mapContainer = useRef();
  const map = useRef();

  useEffect(() => {
    console.log("mount!!", props);
    const coordinate = [longitude, latitude];
    const coordProjected = transform(coordinate, "EPSG:4326", "EPSG:3857");
    map.current = new Map({
      target: mapContainer.current,
      layers: [
        new TileLayer({
          source: new XYZ({ url: tileLayerUrl }),
          properties: {
            name: "baseLayer",
          },
        }),
        new LayerGroup({
          layers: [],
          properties: {
            name: "layerGroup",
          },
        }),
      ],
      view: new View({
        center: coordProjected,
        zoom,
      }),
    });
  }, []);

  useEffect(() => {
    map.current.getView().setZoom(zoom);
  }, [zoom]);

  useEffect(() => {
    const coordinate = [longitude, latitude];
    const coordProjected = transform(coordinate, "EPSG:4326", "EPSG:3857");
    map.current.getView().setCenter(coordProjected);
  }, [longitude, latitude]);

  // console.log("Plugin props!!!", props);

  useEffect(() => {
    if (map.current && tileLayerUrl) {
      const layers = map.current.getLayers();
      const baseLayer = layers
        .getArray()
        .find((l) => l.getProperties().name === "baseLayer");
      baseLayer.setSource(new XYZ({ url: tileLayerUrl }));
    }
  }, [tileLayerUrl]);

  useEffect(() => {
    if (map.current && data) {
      const layers = map.current.getLayers();
      const layerGroup = layers
        .getArray()
        .find((l) => l.getProperties().name === "layerGroup");
      layerGroup.getLayers().clear();

      const layerNames = Object.keys(data[0]);
      layerNames.forEach((layerName) => {
        const features = data
          .filter((d) => d[layerName] && testIfGeoJSON(d[layerName]))
          .map((d) => JSON.parse(d[layerName]));

        if (!features.length) return;

        const fc = {
          type: "FeatureCollection",
          crs: {
            type: "name",
            properties: {
              name: "EPSG:4326",
            },
          },
          features,
        };

        const vectorFeatures = reader.readFeatures(fc, {
          dataProjection: "EPSG:4326",
          featureProjection: "EPSG:3857",
        });

        const vectorSource = new VectorSource({
          features: vectorFeatures,
        });

        const pointStyle = new Style({
          image: new CircleStyle({
            radius: props.circleRadius,
            fill: new Fill({
              color: props.circleFillColorPicker
                ? [
                    props.circleFillColorPicker.r,
                    props.circleFillColorPicker.g,
                    props.circleFillColorPicker.b,
                    props.circleFillColorPicker.a,
                  ]
                : "black",
            }),
            stroke: new Stroke({
              color: props.circleStrokeColorPicker
                ? [
                    props.circleStrokeColorPicker.r,
                    props.circleStrokeColorPicker.g,
                    props.circleStrokeColorPicker.b,
                    props.circleStrokeColorPicker.a,
                  ]
                : "black",
              width: 1,
            }),
          }),
        });
        const lineStyle = new Style({
          stroke: new Stroke({
            color: props.strokeColorPicker
              ? [
                  props.strokeColorPicker.r,
                  props.strokeColorPicker.g,
                  props.strokeColorPicker.b,
                  props.strokeColorPicker.a,
                ]
              : "black",
            width: +props.strokeWidth,
          }),
        });

        const polygonStyle = new Style({
          stroke: new Stroke({
            color: props.polygonStrokeColorPicker
              ? [
                  props.polygonStrokeColorPicker.r,
                  props.polygonStrokeColorPicker.g,
                  props.polygonStrokeColorPicker.b,
                  props.polygonStrokeColorPicker.a,
                ]
              : "black",
            width: +props.polygonStrokeWidth,
          }),
          fill: new Fill({
            color: props.fillColorPicker
              ? [
                  props.fillColorPicker.r,
                  props.fillColorPicker.g,
                  props.fillColorPicker.b,
                  props.fillColorPicker.a,
                ]
              : "black",
          }),
        });
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          style: (f) => {
            const geometryType = f.getGeometry().getType();

            if (geometryType === "Point" || geometryType === "MultiPoint") {
              return pointStyle;
            }
            if (
              geometryType === "LineString" ||
              geometryType === "MultiLineString"
            ) {
              return lineStyle;
            }
            if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
              return polygonStyle;
            }
          },
        });

        layerGroup.getLayers().push(vectorLayer);
      });
    }
  }, [data]);

  return (
    <Styles
      ref={rootElem}
      boldText={props.boldText}
      headerFontSize={props.headerFontSize}
      height={height}
      width={width}
    >
      <h3>{props.headerText}</h3>
      <div className="map-container" ref={mapContainer}></div>
    </Styles>
  );
}
