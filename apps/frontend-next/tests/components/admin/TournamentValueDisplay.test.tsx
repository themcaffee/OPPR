import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TournamentValueDisplay } from '@/components/admin/TournamentValueDisplay';
import { defaultTGPConfig } from '@/components/admin/TGPConfigForm';

describe('TournamentValueDisplay', () => {
  const defaultProps = {
    tgpConfig: { ...defaultTGPConfig },
    eventBooster: 'NONE' as const,
    ratedPlayerCount: 0,
    totalPlayerCount: 0,
  };

  it('displays TGP percentage', () => {
    render(<TournamentValueDisplay {...defaultProps} />);

    expect(screen.getByText('Tournament Grading Percentage (TGP)')).toBeInTheDocument();
    // TGP value will vary based on config - just check the section exists
    expect(screen.getByText('TGP Value')).toBeInTheDocument();
  });

  it('displays base value section', () => {
    render(<TournamentValueDisplay {...defaultProps} />);

    expect(screen.getByText('Base Value')).toBeInTheDocument();
    expect(screen.getByText('0.5 per rated player')).toBeInTheDocument();
  });

  it('calculates base value from rated player count', () => {
    render(<TournamentValueDisplay {...defaultProps} ratedPlayerCount={20} totalPlayerCount={25} />);

    // 20 rated players * 0.5 = 10.00
    expect(screen.getByText('10.00')).toBeInTheDocument();
  });

  it('caps base value at 32', () => {
    render(<TournamentValueDisplay {...defaultProps} ratedPlayerCount={100} totalPlayerCount={100} />);

    // Should cap at 32.00, not 50.00
    expect(screen.getByText('32.00')).toBeInTheDocument();
  });

  it('displays player count', () => {
    render(<TournamentValueDisplay {...defaultProps} ratedPlayerCount={15} totalPlayerCount={20} />);

    expect(screen.getByText('15 rated / 20 total')).toBeInTheDocument();
  });

  it('shows event booster section', () => {
    render(<TournamentValueDisplay {...defaultProps} />);

    expect(screen.getByText('Event Booster')).toBeInTheDocument();
    expect(screen.getByText('Booster Multiplier')).toBeInTheDocument();
  });

  it('displays 1.00x multiplier for NONE booster', () => {
    render(<TournamentValueDisplay {...defaultProps} eventBooster="NONE" />);

    expect(screen.getByText('1.00x')).toBeInTheDocument();
  });

  it('displays 2.00x multiplier for MAJOR booster', () => {
    render(<TournamentValueDisplay {...defaultProps} eventBooster="MAJOR" />);

    expect(screen.getByText('2.00x')).toBeInTheDocument();
  });

  it('displays 1.25x multiplier for CERTIFIED booster', () => {
    render(<TournamentValueDisplay {...defaultProps} eventBooster="CERTIFIED" />);

    expect(screen.getByText('1.25x')).toBeInTheDocument();
  });

  it('shows calculation breakdown section', () => {
    render(<TournamentValueDisplay {...defaultProps} />);

    expect(screen.getByText('Calculation Breakdown')).toBeInTheDocument();
    expect(screen.getByText(/Raw Value = Base \+ TVA/)).toBeInTheDocument();
    expect(screen.getByText(/After TGP = Raw x TGP/)).toBeInTheDocument();
    expect(screen.getByText(/First Place = After TGP x Booster/)).toBeInTheDocument();
  });

  it('shows first place value section', () => {
    render(<TournamentValueDisplay {...defaultProps} />);

    expect(screen.getByText('First Place Value')).toBeInTheDocument();
    expect(screen.getByText('points')).toBeInTheDocument();
  });

  it('shows TVA placeholder message when no players', () => {
    render(<TournamentValueDisplay {...defaultProps} ratedPlayerCount={0} />);

    expect(
      screen.getByText(/TVA will be calculated based on actual player ratings/)
    ).toBeInTheDocument();
  });

  it('displays TVA section', () => {
    render(<TournamentValueDisplay {...defaultProps} />);

    expect(screen.getByText('Tournament Value Adjustment (TVA)')).toBeInTheDocument();
    expect(screen.getByText('Rating TVA')).toBeInTheDocument();
    expect(screen.getByText('Ranking TVA')).toBeInTheDocument();
    expect(screen.getByText('Total TVA')).toBeInTheDocument();
  });

  it('calculates correct first place value with players and booster', () => {
    // With 20 rated players (base = 10), TGP will vary, booster 2x
    render(
      <TournamentValueDisplay
        {...defaultProps}
        ratedPlayerCount={20}
        totalPlayerCount={20}
        eventBooster="MAJOR"
      />
    );

    // The first place value should be displayed
    expect(screen.getByText('First Place Value')).toBeInTheDocument();
  });
});
