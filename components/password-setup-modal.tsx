"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface PasswordSetupModalProps {
  isOpen: boolean;
  onComplete: () => void;
  userEmail: string;
}

export default function PasswordSetupModal({
  isOpen,
  onComplete,
  userEmail,
}: PasswordSetupModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  // Fetch user email if not provided
  useEffect(() => {
    if (!userEmail && isOpen) {
      const fetchUserEmail = async () => {
        try {
          const response = await fetch("/api/user/profile");
          if (response.ok) {
            const data = await response.json();
            setCurrentUserEmail(data.email || "");
          }
        } catch (error) {
          console.error("Error fetching user email:", error);
        }
      };
      fetchUserEmail();
    } else {
      setCurrentUserEmail(userEmail);
    }
  }, [userEmail, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      console.log("=== PASSWORD SETUP API CALL ===");
      console.log("Sending password length:", password.length);

      const response = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      const responseText = await response.text();
      console.log("Raw response:", responseText);

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          console.log("Parsed success data:", data);
          localStorage.removeItem("userEmail");
          onComplete();
        } catch (parseError) {
          console.log("Success but no JSON - completing anyway");
          onComplete();
        }
      } else {
        try {
          const data = JSON.parse(responseText);
          setError(data.error || "Failed to setup password");
        } catch (parseError) {
          setError(`HTTP ${response.status}: ${responseText}`);
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please try again.");
    }

    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onComplete()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Setup Your Password
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Create a password so you can sign in later
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={currentUserEmail}
              disabled
              className="bg-gray-100 text-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password (min 6 characters)"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? "Setting up..." : "Complete Setup"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
