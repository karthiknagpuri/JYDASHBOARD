import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the components
jest.mock('./components/ParticipantUpload', () => {
  return function MockParticipantUpload({ onUploadSuccess }) {
    return (
      <div data-testid="participant-upload">
        <button onClick={() => onUploadSuccess([{ id: 1, name: 'Test' }])}>
          Upload CSV
        </button>
      </div>
    );
  };
});

jest.mock('./components/ParticipantTable', () => {
  return function MockParticipantTable({ participants }) {
    return (
      <div data-testid="participant-table">
        Participants: {participants.length}
      </div>
    );
  };
});

jest.mock('./components/DataVisualizations', () => {
  return function MockDataVisualizations() {
    return <div data-testid="data-visualizations">Data Visualizations</div>;
  };
});

jest.mock('./components/KPIDashboard', () => {
  return function MockKPIDashboard() {
    return <div data-testid="kpi-dashboard">KPI Dashboard</div>;
  };
});

jest.mock('./components/DataQuality', () => {
  return function MockDataQuality() {
    return <div data-testid="data-quality">Data Quality</div>;
  };
});

jest.mock('./components/InteractiveAnalytics', () => {
  return function MockInteractiveAnalytics() {
    return <div data-testid="interactive-analytics">Interactive Analytics</div>;
  };
});

describe('App Component', () => {
  beforeEach(() => {
    // Reset fetch mock
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ participants: [] })
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Jagriti Yatra/i)).toBeInTheDocument();
  });

  test('loads participants on mount', async () => {
    const mockParticipants = [
      { id: 1, yatri_id: 'YT001', first_name: 'John' },
      { id: 2, yatri_id: 'YT002', first_name: 'Jane' }
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ participants: mockParticipants })
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/participants');
    });
  });

  test('shows alert messages', async () => {
    render(<App />);
    
    // Click upload button to trigger success alert
    const uploadButton = screen.getByText('Upload CSV');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/Successfully processed/i)).toBeInTheDocument();
    });
  });

  test('switches tabs when clicking sidebar items', async () => {
    render(<App />);
    
    // Initially shows upload component
    expect(screen.getByTestId('participant-upload')).toBeInTheDocument();

    // Click on Participants tab
    const participantsTab = screen.getByText(/Participants \(/i);
    fireEvent.click(participantsTab);

    // Should show participant table
    expect(screen.getByTestId('participant-table')).toBeInTheDocument();
  });

  test('handles upload success', async () => {
    render(<App />);
    
    const uploadButton = screen.getByText('Upload CSV');
    fireEvent.click(uploadButton);

    await waitFor(() => {
      // Should switch to Interactive Analytics tab (index 5)
      expect(screen.getByTestId('interactive-analytics')).toBeInTheDocument();
    });
  });

  test('responsive sidebar behavior', () => {
    // Mock mobile viewport
    window.innerWidth = 500;
    fireEvent(window, new Event('resize'));

    render(<App />);
    
    // Should render mobile menu button
    const mobileMenuButton = document.querySelector('.mobile-menu-btn');
    expect(mobileMenuButton).toBeInTheDocument();
  });

  test('displays loading state', () => {
    render(<App />);
    
    // The loading spinner should not be visible initially
    const spinner = document.querySelector('[style*="animation: spin"]');
    expect(spinner).not.toBeInTheDocument();
  });

  test('handles API errors gracefully', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load participants/i)).toBeInTheDocument();
    });
  });

  test('all navigation tabs are present', () => {
    render(<App />);
    
    expect(screen.getByText('Upload CSV')).toBeInTheDocument();
    expect(screen.getByText(/Participants/i)).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Executive KPIs')).toBeInTheDocument();
    expect(screen.getByText('Data Quality')).toBeInTheDocument();
    expect(screen.getByText('Interactive Analytics')).toBeInTheDocument();
  });

  test('footer is rendered', () => {
    render(<App />);
    
    expect(screen.getByText(/Jagriti Yatra Dashboard - CSV Processor/i)).toBeInTheDocument();
  });
});