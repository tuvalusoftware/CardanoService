import express from "express";

declare global {
  namespace Express {
    interface Application {
      closeServer: () => void;
    }
  }
}
