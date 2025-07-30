'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material';

interface LoginFormProps {
  title: string;
  onSubmit: (id: string) => Promise<void>;
  loading: boolean;
  idLabel?: string;
  helperText?: string;
}

export default function LoginForm({ 
  title, 
  onSubmit, 
  loading, 
  idLabel = "ID",
  helperText = "Enter your ID to login"
}: LoginFormProps) {
  const [id, setId] = useState('');

  const handleSubmit = async () => {
    if (id.trim()) {
      await onSubmit(id.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && id.trim() && !loading) {
      handleSubmit();
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label={idLabel}
            value={id}
            onChange={(e) => setId(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
            helperText={helperText}
            autoComplete="off"
          />
          <Button
            fullWidth
            variant="outlined"
            onClick={handleSubmit}
            disabled={loading || !id.trim()}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
