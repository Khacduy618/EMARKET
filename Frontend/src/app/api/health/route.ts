// Health check endpoint cho Docker health check
export async function GET() {
  try {
    // Kiểm tra các service cần thiết
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    };

    return Response.json(checks, { status: 200 });
  } catch (error) {
    return Response.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, 
      { status: 503 }
    );
  }
}