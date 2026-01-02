import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('output', () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('output function', () => {
    it('should output JSON when json option is true', async () => {
      const { output } = await import('../../src/utils/output.js');
      const data = { id: '123', name: 'Test' };

      output(data, { json: true });

      expect(consoleLogSpy).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
    });

    it('should output "No results found" for empty arrays', async () => {
      const { output } = await import('../../src/utils/output.js');

      output([], { json: false });

      expect(consoleLogSpy).toHaveBeenCalled();
      const call = consoleLogSpy.mock.calls[0]?.[0] as string;
      expect(call).toContain('No results found');
    });
  });

  describe('success function', () => {
    it('should log success message with check mark', async () => {
      const { success } = await import('../../src/utils/output.js');

      success('Test message');

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });

  describe('error function', () => {
    it('should log error message', async () => {
      const { error } = await import('../../src/utils/output.js');

      error('Test error');

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('warn function', () => {
    it('should log warning message', async () => {
      const { warn } = await import('../../src/utils/output.js');

      warn('Test warning');

      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('info function', () => {
    it('should log info message', async () => {
      const { info } = await import('../../src/utils/output.js');

      info('Test info');

      expect(consoleLogSpy).toHaveBeenCalled();
    });
  });
});
