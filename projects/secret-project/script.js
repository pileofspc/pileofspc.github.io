"use strict"

const fullRotationCounts = document.getElementById('full-rotation-counts');
const oneDegreeCounts = document.getElementById('one-degree-counts');
const sensMatcher = document.getElementById('sens-matcher');


const YAW = 0.022;
oneDegreeCounts.value = `${fullRotationCounts.value/360}`;
sensMatcher.value = `${1/oneDegreeCounts.value}`;