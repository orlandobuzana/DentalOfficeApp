import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Verify required environment variables
function checkRequiredEnvVars() {
  const requiredVars = ['DATABASE_URL'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    log(`Missing required environment variables: ${missing.join(', ')}`);
    // Don't exit in development, just warn
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

// Enhanced startup with proper error handling
async function startServer() {
  try {
    // Check environment variables
    checkRequiredEnvVars();
    
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      
      log(`Error: ${status} - ${message}`);
      res.status(status).json({ message });
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    
    return new Promise<void>((resolve, reject) => {
      const httpServer = server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, (err?: Error) => {
        if (err) {
          log(`Failed to start server: ${err.message}`);
          reject(err);
        } else {
          log(`Server successfully started on port ${port}`);
          log(`Health check available at http://0.0.0.0:${port}/health`);
          resolve();
        }
      });
      
      // Handle server errors
      httpServer.on('error', (error: Error) => {
        log(`Server error: ${error.message}`);
        reject(error);
      });
    });
    
  } catch (error) {
    log(`Failed to initialize server: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer().catch((error) => {
  log(`Server startup failed: ${error.message}`);
  process.exit(1);
});
