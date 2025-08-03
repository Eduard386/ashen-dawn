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
  healthScore: number; // 0-100
}

export class PerformanceProfiler {
  private config: PerformanceConfig;
  private samples: ProfilerSample[] = [];
  private isRunning = false;
  private startTime = 0;
  private lastFrameTime = 0;
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private currentFPS = 0;
  
  // Performance tracking
  private frameTimeHistory: number[] = [];
  private memoryHistory: number[] = [];
  private fpsHistory: number[] = [];
  
  // Alerts
  private alertCallbacks: ((alert: PerformanceAlert) => void)[] = [];
  private lastAlerts: Map<string, number> = new Map();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enableProfiling: true,
      enableMemoryTracking: true,
      enableFPSMonitoring: true,
      sampleInterval: 1000, // 1 second
      reportInterval: 30000, // 30 seconds
      maxSamples: 1000,
      alertThresholds: {
        fps: 30,
        memory: 512 * 1024 * 1024, // 512MB
        frameTime: 33 // 33ms (30 FPS)
      },
      ...config
    };

    this.initializeProfiler();
  }

  /**
   * Initialize the profiler
   */
  private initializeProfiler(): void {
    if (this.config.enableProfiling) {
      this.setupSampling();
    }

    if (this.config.enableFPSMonitoring) {
      this.setupFPSMonitoring();
    }

    console.log('📊 Performance profiler initialized');
  }

  /**
   * Start profiling
   */
  public start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.frameCount = 0;
    this.samples = [];

    console.log('🏃 Performance profiling started');
  }

  /**
   * Stop profiling
   */
  public stop(): PerformanceReport {
    if (!this.isRunning) {
      return this.generateEmptyReport();
    }

    this.isRunning = false;
    const report = this.generateReport();
    
    console.log('⏹️ Performance profiling stopped');
    return report;
  }

  /**
   * Record frame timing
   */
  public recordFrame(): void {
    if (!this.isRunning) return;

    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    // Update frame time history
    this.frameTimeHistory.push(frameTime);
    if (this.frameTimeHistory.length > this.config.maxSamples) {
      this.frameTimeHistory.shift();
    }

    // Check for frame time alerts
    if (frameTime > this.config.alertThresholds.frameTime) {
      this.triggerAlert('frame_time', `High frame time: ${frameTime.toFixed(2)}ms`);
    }
  }

  /**
   * Update FPS calculation
   */
  private updateFPS(): void {
    const now = performance.now();
    if (now - this.lastFPSUpdate >= 1000) {
      this.currentFPS = this.frameCount * 1000 / (now - this.lastFPSUpdate);
      this.frameCount = 0;
      this.lastFPSUpdate = now;

      // Update FPS history
      this.fpsHistory.push(this.currentFPS);
      if (this.fpsHistory.length > this.config.maxSamples) {
        this.fpsHistory.shift();
      }

      // Check for FPS alerts
      if (this.currentFPS < this.config.alertThresholds.fps) {
        this.triggerAlert('low_fps', `Low FPS: ${this.currentFPS.toFixed(1)}`);
      }
    }
  }

  /**
   * Sample current performance metrics
   */
  public sampleMetrics(scene?: string, action?: string): void {
    if (!this.isRunning) return;

    const metrics = this.collectMetrics();
    const sample: ProfilerSample = {
      timestamp: performance.now(),
      metrics,
      scene,
      action
    };

    this.samples.push(sample);

    // Maintain sample limit
    if (this.samples.length > this.config.maxSamples) {
      this.samples.shift();
    }

    // Check for memory alerts
    if (metrics.memoryUsage > this.config.alertThresholds.memory) {
      this.triggerAlert('high_memory', `High memory usage: ${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
    }
  }

  /**
   * Collect current performance metrics
   */
  private collectMetrics(): PerformanceMetrics {
    const memoryInfo = this.getMemoryInfo();
    
    return {
      fps: this.currentFPS,
      frameTime: this.frameTimeHistory.length > 0 
        ? this.frameTimeHistory[this.frameTimeHistory.length - 1] 
        : 0,
      memoryUsage: memoryInfo.usedJSHeapSize || 0,
      cpuUsage: this.estimateCPUUsage(),
      renderTime: this.estimateRenderTime(),
      updateTime: this.estimateUpdateTime(),
      drawCalls: this.estimateDrawCalls(),
      textureMemory: memoryInfo.totalJSHeapSize || 0
    };
  }

  /**
   * Get memory information
   */
  private getMemoryInfo(): any {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return {};
  }

  /**
   * Estimate CPU usage (placeholder implementation)
   */
  private estimateCPUUsage(): number {
    // In a real implementation, this would measure actual CPU usage
    const avgFrameTime = this.frameTimeHistory.length > 0
      ? this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length
      : 16.67;
    
    return Math.min(100, (avgFrameTime / 16.67) * 100);
  }

  /**
   * Estimate render time
   */
  private estimateRenderTime(): number {
    // Placeholder - in real implementation, measure actual render time
    return this.frameTimeHistory.length > 0 
      ? this.frameTimeHistory[this.frameTimeHistory.length - 1] * 0.6 
      : 0;
  }

  /**
   * Estimate update time
   */
  private estimateUpdateTime(): number {
    // Placeholder - in real implementation, measure actual update time
    return this.frameTimeHistory.length > 0 
      ? this.frameTimeHistory[this.frameTimeHistory.length - 1] * 0.4 
      : 0;
  }

  /**
   * Estimate draw calls
   */
  private estimateDrawCalls(): number {
    // Placeholder - in real implementation, track actual draw calls
    return Math.floor(Math.random() * 100) + 50;
  }

  /**
   * Setup automatic sampling
   */
  private setupSampling(): void {
    setInterval(() => {
      if (this.isRunning) {
        this.sampleMetrics();
      }
    }, this.config.sampleInterval);
  }

  /**
   * Setup FPS monitoring
   */
  private setupFPSMonitoring(): void {
    const frameLoop = () => {
      if (this.isRunning) {
        this.recordFrame();
        this.updateFPS();
      }
      requestAnimationFrame(frameLoop);
    };
    
    requestAnimationFrame(frameLoop);
  }

  /**
   * Generate performance report
   */
  private generateReport(): PerformanceReport {
    if (this.samples.length === 0) {
      return this.generateEmptyReport();
    }

    const metrics = this.samples.map(s => s.metrics);
    
    const averageMetrics = this.calculateAverageMetrics(metrics);
    const peakMetrics = this.calculatePeakMetrics(metrics);
    const lowMetrics = this.calculateLowMetrics(metrics);
    const trends = this.analyzeTrends();
    const recommendations = this.generateRecommendations(averageMetrics, trends);
    const healthScore = this.calculateHealthScore(averageMetrics, trends);

    return {
      averageMetrics,
      peakMetrics,
      lowMetrics,
      trends,
      recommendations,
      healthScore
    };
  }

  /**
   * Calculate average metrics
   */
  private calculateAverageMetrics(metrics: PerformanceMetrics[]): PerformanceMetrics {
    const sum = metrics.reduce((acc, m) => ({
      fps: acc.fps + m.fps,
      frameTime: acc.frameTime + m.frameTime,
      memoryUsage: acc.memoryUsage + m.memoryUsage,
      cpuUsage: acc.cpuUsage + m.cpuUsage,
      renderTime: acc.renderTime + m.renderTime,
      updateTime: acc.updateTime + m.updateTime,
      drawCalls: acc.drawCalls + m.drawCalls,
      textureMemory: acc.textureMemory + m.textureMemory
    }), {
      fps: 0, frameTime: 0, memoryUsage: 0, cpuUsage: 0,
      renderTime: 0, updateTime: 0, drawCalls: 0, textureMemory: 0
    });

    const count = metrics.length;
    return {
      fps: sum.fps / count,
      frameTime: sum.frameTime / count,
      memoryUsage: sum.memoryUsage / count,
      cpuUsage: sum.cpuUsage / count,
      renderTime: sum.renderTime / count,
      updateTime: sum.updateTime / count,
      drawCalls: sum.drawCalls / count,
      textureMemory: sum.textureMemory / count
    };
  }

  /**
   * Calculate peak metrics
   */
  private calculatePeakMetrics(metrics: PerformanceMetrics[]): PerformanceMetrics {
    return metrics.reduce((peak, m) => ({
      fps: Math.max(peak.fps, m.fps),
      frameTime: Math.max(peak.frameTime, m.frameTime),
      memoryUsage: Math.max(peak.memoryUsage, m.memoryUsage),
      cpuUsage: Math.max(peak.cpuUsage, m.cpuUsage),
      renderTime: Math.max(peak.renderTime, m.renderTime),
      updateTime: Math.max(peak.updateTime, m.updateTime),
      drawCalls: Math.max(peak.drawCalls, m.drawCalls),
      textureMemory: Math.max(peak.textureMemory, m.textureMemory)
    }));
  }

  /**
   * Calculate low metrics
   */
  private calculateLowMetrics(metrics: PerformanceMetrics[]): PerformanceMetrics {
    return metrics.reduce((low, m) => ({
      fps: Math.min(low.fps, m.fps),
      frameTime: Math.min(low.frameTime, m.frameTime),
      memoryUsage: Math.min(low.memoryUsage, m.memoryUsage),
      cpuUsage: Math.min(low.cpuUsage, m.cpuUsage),
      renderTime: Math.min(low.renderTime, m.renderTime),
      updateTime: Math.min(low.updateTime, m.updateTime),
      drawCalls: Math.min(low.drawCalls, m.drawCalls),
      textureMemory: Math.min(low.textureMemory, m.textureMemory)
    }));
  }

  /**
   * Analyze performance trends
   */
  private analyzeTrends(): PerformanceReport['trends'] {
    const recentSamples = this.samples.slice(-10);
    const olderSamples = this.samples.slice(-20, -10);

    if (recentSamples.length < 5 || olderSamples.length < 5) {
      return { fps: 'stable', memory: 'stable', performance: 'stable' };
    }

    const recentAvgFPS = recentSamples.reduce((sum, s) => sum + s.metrics.fps, 0) / recentSamples.length;
    const olderAvgFPS = olderSamples.reduce((sum, s) => sum + s.metrics.fps, 0) / olderSamples.length;

    const recentAvgMemory = recentSamples.reduce((sum, s) => sum + s.metrics.memoryUsage, 0) / recentSamples.length;
    const olderAvgMemory = olderSamples.reduce((sum, s) => sum + s.metrics.memoryUsage, 0) / olderSamples.length;

    const fpsTrend = this.classifyTrend(recentAvgFPS, olderAvgFPS, true);
    const memoryTrend = this.classifyTrend(recentAvgMemory, olderAvgMemory, false);
    
    const performanceTrend = fpsTrend === 'improving' && memoryTrend !== 'declining' 
      ? 'improving' 
      : fpsTrend === 'declining' || memoryTrend === 'declining'
      ? 'declining'
      : 'stable';

    return {
      fps: fpsTrend,
      memory: memoryTrend,
      performance: performanceTrend
    };
  }

  /**
   * Classify trend direction
   */
  private classifyTrend(recent: number, older: number, higherIsBetter: boolean): 'improving' | 'stable' | 'declining' {
    const threshold = 0.05; // 5% threshold
    const change = (recent - older) / older;

    if (Math.abs(change) < threshold) return 'stable';
    
    if (higherIsBetter) {
      return change > 0 ? 'improving' : 'declining';
    } else {
      return change < 0 ? 'improving' : 'declining';
    }
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(metrics: PerformanceMetrics, trends: PerformanceReport['trends']): string[] {
    const recommendations: string[] = [];

    if (metrics.fps < 30) {
      recommendations.push('Low FPS detected - consider reducing visual effects or optimizing render pipeline');
    }

    if (metrics.memoryUsage > 256 * 1024 * 1024) {
      recommendations.push('High memory usage - implement asset pooling and garbage collection optimization');
    }

    if (metrics.frameTime > 33) {
      recommendations.push('High frame time - profile and optimize game loop bottlenecks');
    }

    if (trends.memory === 'declining') {
      recommendations.push('Memory usage increasing - check for memory leaks and implement cleanup strategies');
    }

    if (trends.fps === 'declining') {
      recommendations.push('FPS declining over time - investigate performance degradation causes');
    }

    if (metrics.drawCalls > 500) {
      recommendations.push('High draw call count - consider batching sprites and reducing draw operations');
    }

    return recommendations;
  }

  /**
   * Calculate overall health score
   */
  private calculateHealthScore(metrics: PerformanceMetrics, trends: PerformanceReport['trends']): number {
    let score = 100;

    // FPS scoring
    if (metrics.fps < 30) score -= 30;
    else if (metrics.fps < 45) score -= 15;
    else if (metrics.fps < 60) score -= 5;

    // Memory scoring
    const memoryMB = metrics.memoryUsage / 1024 / 1024;
    if (memoryMB > 512) score -= 25;
    else if (memoryMB > 256) score -= 15;
    else if (memoryMB > 128) score -= 5;

    // Frame time scoring
    if (metrics.frameTime > 50) score -= 20;
    else if (metrics.frameTime > 33) score -= 10;
    else if (metrics.frameTime > 20) score -= 5;

    // Trend penalties
    if (trends.fps === 'declining') score -= 10;
    if (trends.memory === 'declining') score -= 10;
    if (trends.performance === 'declining') score -= 15;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Trigger performance alert
   */
  private triggerAlert(type: string, message: string): void {
    const now = Date.now();
    const lastAlert = this.lastAlerts.get(type) || 0;
    
    // Throttle alerts (minimum 5 seconds between same type)
    if (now - lastAlert < 5000) return;

    this.lastAlerts.set(type, now);
    
    const alert: PerformanceAlert = {
      type,
      message,
      timestamp: now,
      severity: this.getAlertSeverity(type)
    };

    for (const callback of this.alertCallbacks) {
      callback(alert);
    }
  }

  /**
   * Get alert severity
   */
  private getAlertSeverity(type: string): 'low' | 'medium' | 'high' {
    switch (type) {
      case 'low_fps': return 'high';
      case 'high_memory': return 'medium';
      case 'frame_time': return 'medium';
      default: return 'low';
    }
  }

  /**
   * Generate empty report
   */
  private generateEmptyReport(): PerformanceReport {
    const emptyMetrics: PerformanceMetrics = {
      fps: 0, frameTime: 0, memoryUsage: 0, cpuUsage: 0,
      renderTime: 0, updateTime: 0, drawCalls: 0, textureMemory: 0
    };

    return {
      averageMetrics: emptyMetrics,
      peakMetrics: emptyMetrics,
      lowMetrics: emptyMetrics,
      trends: { fps: 'stable', memory: 'stable', performance: 'stable' },
      recommendations: [],
      healthScore: 0
    };
  }

  /**
   * Add alert callback
   */
  public onAlert(callback: (alert: PerformanceAlert) => void): void {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get current metrics
   */
  public getCurrentMetrics(): PerformanceMetrics {
    return this.collectMetrics();
  }

  /**
   * Get profiler status
   */
  public getStatus() {
    return {
      isRunning: this.isRunning,
      samples: this.samples.length,
      currentFPS: this.currentFPS.toFixed(1),
      uptime: this.isRunning ? performance.now() - this.startTime : 0,
      memoryUsage: this.getMemoryInfo()
    };
  }
}

export interface PerformanceAlert {
  type: string;
  message: string;
  timestamp: number;
  severity: 'low' | 'medium' | 'high';
}

// Global profiler instance
export const globalProfiler = new PerformanceProfiler({
  enableProfiling: true,
  enableMemoryTracking: true,
  enableFPSMonitoring: true,
  sampleInterval: 2000,
  reportInterval: 30000
});
