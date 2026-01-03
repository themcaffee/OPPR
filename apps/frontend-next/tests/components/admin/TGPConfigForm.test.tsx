import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TGPConfigForm, defaultTGPConfig, type EventBoosterType } from '@/components/admin/TGPConfigForm';
import type { TGPConfig } from '@opprs/core';

describe('TGPConfigForm', () => {
  const defaultProps = {
    tgpConfig: { ...defaultTGPConfig },
    eventBooster: 'NONE' as EventBoosterType,
    onTGPConfigChange: vi.fn(),
    onEventBoosterChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders qualifying type dropdown', () => {
    render(<TGPConfigForm {...defaultProps} />);

    expect(screen.getByLabelText('Type')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Type' })).toHaveValue('limited');
  });

  it('renders finals format type dropdown', () => {
    render(<TGPConfigForm {...defaultProps} />);

    expect(screen.getByLabelText(/format type/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Single Elimination')).toBeInTheDocument();
  });

  it('shows hours input when qualifying type is unlimited', () => {
    const unlimitedConfig: TGPConfig = {
      ...defaultTGPConfig,
      qualifying: { ...defaultTGPConfig.qualifying, type: 'unlimited' },
    };

    render(<TGPConfigForm {...defaultProps} tgpConfig={unlimitedConfig} />);

    expect(screen.getByLabelText(/hours/i)).toBeInTheDocument();
  });

  it('hides hours input for other qualifying types', () => {
    render(<TGPConfigForm {...defaultProps} />);

    expect(screen.queryByLabelText(/hours/i)).not.toBeInTheDocument();
  });

  it('calls onTGPConfigChange when qualifying type changes', () => {
    render(<TGPConfigForm {...defaultProps} />);

    const select = screen.getByRole('combobox', { name: 'Type' });
    fireEvent.change(select, { target: { value: 'unlimited' } });

    expect(defaultProps.onTGPConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        qualifying: expect.objectContaining({ type: 'unlimited' }),
      })
    );
  });

  it('calls onTGPConfigChange when finals format changes', () => {
    render(<TGPConfigForm {...defaultProps} />);

    const select = screen.getByLabelText(/format type/i);
    fireEvent.change(select, { target: { value: 'double-elimination' } });

    expect(defaultProps.onTGPConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        finals: expect.objectContaining({ formatType: 'double-elimination' }),
      })
    );
  });

  it('shows event booster buttons', () => {
    render(<TGPConfigForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: /none \(1\.0x\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /certified \(1\.25x\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /major \(2\.0x\)/i })).toBeInTheDocument();
  });

  it('highlights selected event booster', () => {
    render(<TGPConfigForm {...defaultProps} eventBooster="MAJOR" />);

    const majorButton = screen.getByRole('button', { name: /major \(2\.0x\)/i });
    expect(majorButton).toHaveClass('bg-blue-600');

    const noneButton = screen.getByRole('button', { name: /none \(1\.0x\)/i });
    expect(noneButton).not.toHaveClass('bg-blue-600');
  });

  it('calls onEventBoosterChange when booster selected', () => {
    render(<TGPConfigForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /major \(2\.0x\)/i }));

    expect(defaultProps.onEventBoosterChange).toHaveBeenCalledWith('MAJOR');
  });

  it('shows ball count adjustment buttons', () => {
    render(<TGPConfigForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: /1 ball \(0\.33x\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /2 ball \(0\.66x\)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /3 ball \(1x\)/i })).toBeInTheDocument();
  });

  it('highlights selected ball count', () => {
    render(<TGPConfigForm {...defaultProps} />);

    // Default is 1.0 (3 balls)
    const threeBallButton = screen.getByRole('button', { name: /3 ball \(1x\)/i });
    expect(threeBallButton).toHaveClass('bg-blue-600');
  });

  it('calls onTGPConfigChange when ball count selected', () => {
    render(<TGPConfigForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /2 ball \(0\.66x\)/i }));

    expect(defaultProps.onTGPConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        ballCountAdjustment: 0.66,
      })
    );
  });

  it('disables finals fields when format is none', () => {
    const noFinalsConfig: TGPConfig = {
      ...defaultTGPConfig,
      finals: { ...defaultTGPConfig.finals, formatType: 'none' },
    };

    render(<TGPConfigForm {...defaultProps} tgpConfig={noFinalsConfig} />);

    expect(screen.getByLabelText(/meaningful games/i, { selector: '#finalsGames' })).toBeDisabled();
    expect(screen.getByLabelText(/finalist count/i)).toBeDisabled();
  });

  it('shows qualifying meaningful games input', () => {
    render(<TGPConfigForm {...defaultProps} />);

    const input = screen.getByLabelText(/meaningful games/i, { selector: '#qualifyingGames' });
    expect(input).toHaveValue(5);
  });

  it('calls onTGPConfigChange when qualifying games changes', () => {
    render(<TGPConfigForm {...defaultProps} />);

    const input = screen.getByLabelText(/meaningful games/i, { selector: '#qualifyingGames' });
    fireEvent.change(input, { target: { value: '10' } });

    expect(defaultProps.onTGPConfigChange).toHaveBeenCalledWith(
      expect.objectContaining({
        qualifying: expect.objectContaining({ meaningfulGames: 10 }),
      })
    );
  });

  it('shows 4-player groups checkbox for qualifying', () => {
    render(<TGPConfigForm {...defaultProps} />);

    // There are two 4-player groups checkboxes (qualifying and finals)
    const checkboxes = screen.getAllByText('4-Player Groups (2.0x)');
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
  });

  it('shows 3-player groups checkbox for qualifying', () => {
    render(<TGPConfigForm {...defaultProps} />);

    // There are two 3-player groups checkboxes (qualifying and finals)
    const checkboxes = screen.getAllByText('3-Player Groups (1.5x)');
    expect(checkboxes.length).toBeGreaterThanOrEqual(1);
  });
});
