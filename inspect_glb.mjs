
import fs from 'fs';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { JSDOM } from 'jsdom';

// Polyfill window and document for three.js loaders
const dom = new JSDOM('<!DOCTYPE html>');
global.window = dom.window;
global.document = dom.window.document;
global.self = dom.window;

// Polyfill Image for texture loading (though we might not need textures for structure inspection)
global.Image = dom.window.Image;
global.URL = dom.window.URL;

async function inspectGLB() {
    const loader = new GLTFLoader();
    const buffer = fs.readFileSync('public/padlock.glb');
    
    // Parse the GLB buffer
    loader.parse(buffer.buffer, './public/', (gltf) => {
        console.log('--- GLB Structure ---');
        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                console.log(`Mesh Name: "${child.name}"`);
                console.log(`   Type: ${child.type}`);
                console.log(`   Material: ${child.material.name}`);
            } else if (child.isGroup) {
                console.log(`Group Name: "${child.name}"`);
            }
        });
        console.log('--- End Structure ---');
    }, (error) => {
        console.error('An error happened', error);
    });
}

inspectGLB();
