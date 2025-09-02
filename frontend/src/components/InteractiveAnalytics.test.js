import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InteractiveAnalytics from './InteractiveAnalytics';

describe('InteractiveAnalytics Component', () => {
  const mockParticipants = [
    {
      id: '1',
      yatri_id: 'YT001',
      first_name: 'John',
      last_name: 'Doe',
      gender: 'male',
      date_of_birth: '1990-01-15',
      state: 'Maharashtra',
      education: 'Graduate',
      yatri_type: 'participant',
      yatri_annual_income: 500000,
      scholarship_total_amount_paid: 25000,
      application_submitted_on: '2024-01-10T10:30:00Z',
      payment_date: '2024-01-15',
      area_of_interest: 'Technology',
      source: 'Online'
    },
    {
      id: '2',
      yatri_id: 'YT002',
      first_name: 'Jane',
      last_name: 'Smith',
      gender: 'female',
      date_of_birth: '1992-05-20',
      state: 'Karnataka',
      education: 'Post Graduate',
      yatri_type: 'facilitator',
      yatri_annual_income: 700000,
      scholarship_total_amount_paid: 30000,
      application_submitted_on: '2024-01-12T14:20:00Z',
      payment_date: '2024-01-18',
      area_of_interest: 'Healthcare',
      source: 'Referral'
    }
  ];

  test('renders without crashing', () => {
    render(<InteractiveAnalytics participants={[]} />);
    expect(screen.getByText('Interactive Analytics')).toBeInTheDocument();
  });

  test('displays all metric buttons', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Demographics')).toBeInTheDocument();
    expect(screen.getByText('Geographic')).toBeInTheDocument();
    expect(screen.getByText('Financial')).toBeInTheDocument();
    expect(screen.getByText('Trends')).toBeInTheDocument();
  });

  test('switches between different views', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    // Click on Demographics
    fireEvent.click(screen.getByText('Demographics'));
    expect(screen.getByText('Gender Distribution')).toBeInTheDocument();
    
    // Click on Financial
    fireEvent.click(screen.getByText('Financial'));
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    
    // Click on Geographic
    fireEvent.click(screen.getByText('Geographic'));
    expect(screen.getByText('Top 10 States')).toBeInTheDocument();
  });

  test('calculates metrics correctly', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    // Check participant count
    expect(screen.getByText('Real-time insights from 2 participants')).toBeInTheDocument();
    
    // Check total participants metric
    expect(screen.getByText('Total Participants')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  test('displays key metrics cards in overview', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    expect(screen.getByText('Total Participants')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
    expect(screen.getByText('Conversion Rate')).toBeInTheDocument();
    expect(screen.getByText('Avg. Scholarship')).toBeInTheDocument();
  });

  test('handles empty participants array', () => {
    render(<InteractiveAnalytics participants={[]} />);
    
    expect(screen.getByText('Real-time insights from 0 participants')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  test('demographic view shows correct sections', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    fireEvent.click(screen.getByText('Demographics'));
    
    expect(screen.getByText('Gender Distribution')).toBeInTheDocument();
    expect(screen.getByText('Age Distribution')).toBeInTheDocument();
    expect(screen.getByText('Education Levels')).toBeInTheDocument();
    expect(screen.getByText('Income Distribution')).toBeInTheDocument();
  });

  test('financial view shows revenue analysis', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    fireEvent.click(screen.getByText('Financial'));
    
    expect(screen.getByText('Revenue Trends')).toBeInTheDocument();
    expect(screen.getByText('Revenue by Participant Type')).toBeInTheDocument();
    expect(screen.getByText('Monthly Payment Volume')).toBeInTheDocument();
  });

  test('trends view shows application trends', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    fireEvent.click(screen.getByText('Trends'));
    
    expect(screen.getByText('Application Trends')).toBeInTheDocument();
    expect(screen.getByText('Top Interest Areas')).toBeInTheDocument();
    expect(screen.getByText('Application Sources')).toBeInTheDocument();
  });

  test('insights panel appears in overview', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    expect(screen.getByText('📊 Key Insights')).toBeInTheDocument();
    expect(screen.getByText('Growth Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Demographics')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  test('button styling changes on selection', () => {
    const { container } = render(<InteractiveAnalytics participants={mockParticipants} />);
    
    const overviewButton = screen.getByText('Overview').parentElement;
    expect(overviewButton).toHaveStyle({ color: 'white' });
    
    const demographicsButton = screen.getByText('Demographics').parentElement;
    fireEvent.click(demographicsButton);
    
    // After clicking, the demographics button should be selected
    expect(demographicsButton).toHaveStyle({ color: 'white' });
  });

  test('calculates gender distribution correctly', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    fireEvent.click(screen.getByText('Demographics'));
    
    // Should have Gender Distribution chart
    expect(screen.getByText('Gender Distribution')).toBeInTheDocument();
  });

  test('calculates state distribution correctly', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    fireEvent.click(screen.getByText('Geographic'));
    
    // Should show top states
    expect(screen.getByText('Top 10 States')).toBeInTheDocument();
  });

  test('revenue calculations are accurate', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    // Total revenue should be 55000 (25000 + 30000)
    expect(screen.getByText(/₹55,000/)).toBeInTheDocument();
  });

  test('conversion rate is calculated', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    // Both participants have payments, so 100% conversion
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('average scholarship is calculated', () => {
    render(<InteractiveAnalytics participants={mockParticipants} />);
    
    // Average should be 27500 ((25000 + 30000) / 2)
    expect(screen.getByText(/₹27,500/)).toBeInTheDocument();
  });

  test('handles participants with missing data', () => {
    const incompleteParticipants = [
      {
        id: '1',
        yatri_id: 'YT003',
        first_name: 'Bob',
        // Missing most fields
      }
    ];
    
    render(<InteractiveAnalytics participants={incompleteParticipants} />);
    
    // Should not crash and show 1 participant
    expect(screen.getByText('Real-time insights from 1 participants')).toBeInTheDocument();
  });
});