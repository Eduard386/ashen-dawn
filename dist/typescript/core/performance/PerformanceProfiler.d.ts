/**
 * Performance Monitoring and Profiling System
 * Advanced performance tracking, profiling, and optimization recommendations
 */
export interface PerformanceConfig {
    enableProfiling: boolean;
    enableMemoryTracking: boolean;
    enableFPSMonitoring: boolean;
    sampleInterval: number;
    reportInterval: number;
    maxSamples: number;
    alertThresholds: {
        fps: number;
        memory: number;
        frameTime: number;
    };
}
export interface PerformanceMetrics {
    fps: number;
    frameTime: number;
    memoryUsage: number;
    cpuUsage: number;
    renderTime: number;
    updateTime: number;
    drawCalls: number;
    textureMemory: number;
}
export interface ProfilerSample {
    timestamp: number;
    metrics: PerformanceMetrics;
    scene?: string;
    action?: string;
}
export interface PerformanceReport {
    averageMetrics: PerformanceMetrics;
    peakMetrics: PerformanceMetrics;
    lowMetrics: PerformanceMetrics;
    trends: {
        fps: 'improving' | 'stable' | 'declining';
        memory: 'improving' | 'stable' | 'declining';
        performance: 'improving' | 'stable' | 'declining';
    };
    recommendations: string[];
    healthScore: number;
}
export declare class PerformanceProfiler {
    private config;
    private samples;
    private isRunning;
    private startTime;
    private lastFrameTime;
    private frameCount;
    private lastFPSUpdate;
    private currentFPS;
    private frameTimeHistory;
    private memoryHistory;
    private fpsHistory;
    private alertCallbacks;
    private lastAlerts;
    constructor(config?: Partial<PerformanceConfig>);
    /**
     * Initialize the profiler
     */
    private initializeProfiler;
    /**
     * Start profiling
     */
    start(): void;
    /**
     * Stop profiling
     */
    stop(): PerformanceReport;
    /**
     * Record frame timing
     */
    recordFrame(): void;
    /**
     * Update FPS calculation
     */
    private updateFPS;
    /**
     * Sample current performance metrics
     */
    sampleMetrics(scene?: string, action?: string): void;
    /**
     * Collect current performance metrics
     */
    private collectMetrics;
    /**
     * Get memory information
     */
    private getMemoryInfo;
    /**
     * Estimate CPU usage (placeholder implementation)
     */
    private estimateCPUUsage;
    /**
     * Estimate render time
     */
    private estimateRenderTime;
    /**
     * Estimate update time
     */
    private estimateUpdateTime;
    /**
     * Estimate draw calls
     */
    private estimateDrawCalls;
    /**
     * Setup automatic sampling
     */
    private setupSampling;
    /**
     * Setup FPS monitoring
     */
    private setupFPSMonitoring;
    /**
     * Generate performance report
     */
    private generateReport;
    /**
     * Calculate average metrics
     */
    private calculateAverageMetrics;
    /**
     * Calculate peak metrics
     */
    private calculatePeakMetrics;
    /**
     * Calculate low metrics
     */
    private calculateLowMetrics;
    /**
     * Analyze performance trends
     */
    private analyzeTrends;
    /**
     * Classify trend direction
     */
    private classifyTrend;
    /**
     * Generate optimization recommendations
     */
    private generateRecommendations;
    /**
     * Calculate overall health score
     */
    private calculateHealthScore;
    /**
     * Trigger performance alert
     */
    private triggerAlert;
    /**
     * Get alert severity
     */
    private getAlertSeverity;
    /**
     * Generate empty report
     */
    private generateEmptyReport;
    /**
     * Add alert callback
     */
    onAlert(callback: (alert: PerformanceAlert) => void): void;
    /**
     * Get current metrics
     */
    getCurrentMetrics(): PerformanceMetrics;
    /**
     * Get profiler status
     */
    getStatus(): {
        isRunning: boolean;
        samples: number;
        currentFPS: string;
        uptime: number;
        memoryUsage: any;
    };
}
export interface PerformanceAlert {
    type: string;
    message: string;
    timestamp: number;
    severity: 'low' | 'medium' | 'high';
}
export declare const globalProfiler: PerformanceProfiler;
