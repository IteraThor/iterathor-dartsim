import { SceneManager } from './scene/SceneManager';
import { setupViewControls } from './ui/ViewControls';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('canvas-container');
  const appElement = document.getElementById('app');

  if (!container || !appElement) {
    console.error('Failed to locate app root containers');
    return;
  }

  const sceneManager = new SceneManager(container);
  const hudElement = setupViewControls(sceneManager);
  appElement.appendChild(hudElement);

  // Set default view to 3D Orbit overview showing room, floor, and board
  sceneManager.setViewPreset('isometric', false);
  sceneManager.start();
});
