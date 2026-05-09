import chrome from 'sinon-chrome';
import { vi, afterEach } from 'vitest';

vi.stubGlobal('chrome', chrome);

afterEach(() => {
  chrome.flush();
});
