import {JSDOM} from 'jsdom';
import {StubMediaRecorder} from './stubs/StubMediaRecorder.js';
import {StubFormData} from './stubs/StubFormData.js';

const dom = new JSDOM('<html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;
global.window.alert = () => {};
global.navigator = dom.window.navigator;
global.navigator.mediaDevices = {getUserMedia: () => {}};
global.MediaRecorder = StubMediaRecorder;
global.FormData = StubFormData;