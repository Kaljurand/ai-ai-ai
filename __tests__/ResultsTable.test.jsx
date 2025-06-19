import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsTable } from '../src/ResultsTable.jsx';

describe('ResultsTable', () => {
  test('displays computed WER', () => {
    const texts = [{ text: 'hello world' }];
    const transcripts = [{ aIndex: 0, text: 'hello there' }];
    render(<ResultsTable texts={texts} transcripts={transcripts} />);
    const cell = screen.getByText('0.50');
    expect(cell).toBeInTheDocument();
  });
});
