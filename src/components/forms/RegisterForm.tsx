"use client";
import React from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
}

interface RegisterFormProps {
  title: string;
  onSubmit: (data: RegisterFormData) => Promise<void>;
  loading: boolean;
  phoneRequired?: boolean;
}

export default function RegisterForm({
  title,
  onSubmit,
  loading,
  phoneRequired = false,
}: RegisterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<RegisterFormData>({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmitForm = async (data: RegisterFormData) => {
    await onSubmit(data);
    reset();
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
            label="Full Name"
            {...register("name", {
              required: "Full name is required",
              minLength: {
                value: 2,
                message: "Name must be at least 2 characters",
              },
            })}
            disabled={loading}
            error={!!errors.name}
            helperText={errors.name?.message}
            autoComplete="name"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              validate: {
                validEmail: (value) => {
                  return (
                    /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ||
                    "Please enter a valid email address"
                  );
                },
              },
            })}
            disabled={loading}
            error={!!errors.email}
            helperText={errors.email?.message}
            autoComplete="email"
          />
          <TextField
            fullWidth
            label={`Phone Number${phoneRequired ? "" : " (Optional)"}`}
            type="tel"
            {...register("phone", {
              required: phoneRequired ? "Phone number is required" : false,
              minLength: {
                value: 9,
                message: "Phone number must be at least 9 characters",
              },
            })}
            disabled={loading}
            error={!!errors.phone}
            helperText={errors.phone?.message}
            autoComplete="tel"
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit(onSubmitForm)}
            disabled={loading || !isValid}
          >
            {loading ? "Registering..." : "Register"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
