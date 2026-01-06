"use client";

import { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';

interface ExchangeRateInputProps {
  label?: string;
  value?: number;
  onChange: (rate: number) => void;
  currency?: string;
  className?: string;
}

export function ExchangeRateInput({ 
  label = "Exchange Rate (ETB to USD)", 
  value, 
  onChange,
  currency = "ETB/USD",
  className 
}: ExchangeRateInputProps) {
  const [rate, setRate] = useState<string>(value?.toString() || '');

  useEffect(() => {
    if (value !== undefined) {
      setRate(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setRate(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue);
    }
  };

  return (
    <div className={className}>
      <Label htmlFor="exchange-rate">{label}</Label>
      <div className="relative mt-1">
        <Input
          id="exchange-rate"
          type="number"
          step="0.01"
          min="0"
          placeholder="e.g., 56.50"
          value={rate}
          onChange={handleChange}
          className="pr-20"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <span className="text-sm text-gray-500">{currency}</span>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Current exchange rate for this transaction
      </p>
    </div>
  );
}

interface CurrencyDisplayProps {
  amountETB: number;
  exchangeRate?: number;
  className?: string;
}

export function CurrencyDisplay({ amountETB, exchangeRate, className }: CurrencyDisplayProps) {
  const amountUSD = exchangeRate ? amountETB / exchangeRate : null;

  return (
    <div className={className}>
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Amount (ETB):</span>
          <span className="font-medium">{amountETB.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB</span>
        </div>
        {exchangeRate && amountUSD !== null && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Exchange Rate:</span>
              <span className="font-medium">{exchangeRate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB/USD</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Amount (USD):</span>
              <span className="text-green-600">${amountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}











