import os
import json
from model.configs.config import PipelineConfig
from model.utils.logger import get_logger

logger = get_logger("Reporter")

def load_json_report(file_name):
    """Load JSON report helper."""
    path = os.path.join(PipelineConfig.REPORTS_DIR, file_name)
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read report {file_name}: {e}")
    return None

def generate_html_project_report():
    """Compiles all JSON runtime metrics into a styled HTML and PDF project summary sheet."""
    logger.info("Compiling automatic HTML project summary report...")
    
    # Load all individual reports
    quality = load_json_report("dataset_quality_report.json")
    tuning = load_json_report("hyperparameter_tuning_report.json")
    comparison = load_json_report("model_comparison_report.json")
    cv = load_json_report("cross_validation_report.json")
    eval_metrics = load_json_report("evaluation_report.json")
    deployment = load_json_report("deployment_optimization_report.json")
    
    # CSS template
    style = """
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; background-color: #f7f9fa; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #2ecc71; padding-bottom: 20px; }
        .header h1 { color: #2c3e50; font-size: 2.5em; margin: 0; }
        .header p { color: #7f8c8d; font-size: 1.2em; margin: 10px 0 0 0; }
        .card { background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); padding: 30px; margin-bottom: 30px; border: 1px solid #e1e8ed; }
        .card h2 { color: #2c3e50; border-bottom: 1px solid #ecf0f1; padding-bottom: 10px; margin-top: 0; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .stat-box { background: #f8f9fa; border-radius: 8px; padding: 20px; text-align: center; border-left: 4px solid #3498db; }
        .stat-box.success { border-left-color: #2ecc71; }
        .stat-box.warning { border-left-color: #f1c40f; }
        .stat-box .num { font-size: 2.2em; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
        .stat-box .label { font-size: 0.9em; color: #7f8c8d; text-transform: uppercase; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #e1e8ed; }
        th { background-color: #f4f6f8; color: #2c3e50; font-weight: 600; }
        tr:hover { background-color: #f9fbfe; }
        .image-container { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; margin-top: 20px; }
        .image-card { text-align: center; background: #fff; padding: 15px; border-radius: 8px; border: 1px solid #e1e8ed; max-width: 48%; }
        .image-card img { max-width: 100%; border-radius: 4px; }
        .image-card p { font-size: 0.9em; color: #7f8c8d; margin-top: 10px; }
        .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: 600; }
        .badge-recommended { background-color: #d4edda; color: #155724; }
    </style>
    """
    
    html = f"""<!DOCTYPE html>
    <html>
    <head>
        <title>AI Crop Disease Engine - Project Report</title>
        {style}
    </head>
    <body>
        <div class="header">
            <h1>AI Crop Disease Engine</h1>
            <p>Final Year Engineering Project: Research & Production Training Report</p>
        </div>
    """
    
    # 1. Dataset Audit Section
    if quality:
        html += f"""
        <div class="card">
            <h2>1. Dataset Quality & Validation Audit</h2>
            <div class="grid">
                <div class="stat-box success">
                    <div class="num">{quality.get("total_scanned", 0)}</div>
                    <div class="label">Total Images Scanned</div>
                </div>
                <div class="stat-box success">
                    <div class="num">{quality.get("clean_retained_total", 0)}</div>
                    <div class="label">Clean Retained (Filtered)</div>
                </div>
                <div class="stat-box warning">
                    <div class="num">{quality.get("duplicates_removed", 0)}</div>
                    <div class="label">Duplicates Filtered</div>
                </div>
                <div class="stat-box warning">
                    <div class="num">{quality.get("blurry_removed", 0)}</div>
                    <div class="label">Blurry Images Removed</div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <p><strong>Average Image Resolution:</strong> {quality.get("average_image_width", 0):.1f} x {quality.get("average_image_height", 0):.1f} pixels</p>
                <p><strong>Dataset Balance Status:</strong> {quality.get("balance_status", "Unknown")} (Standard Deviation: {quality.get("class_standard_deviation", 0.0):.2f})</p>
            </div>
        </div>
        """
        
    # 2. Hyperparameter Tuning Section
    if tuning:
        trials_rows = ""
        for t in tuning.get("tuning_results", []):
            trials_rows += f"""
            <tr>
                <td>Trial {t.get("trial")}</td>
                <td>{t.get("optimizer")}</td>
                <td>{t.get("learning_rate")}</td>
                <td>{t.get("dropout_rate")}</td>
                <td>{t.get("batch_size")}</td>
                <td>{t.get("val_accuracy", 0.0):.4f}</td>
                <td>{t.get("duration_seconds", 0.0):.1f}s</td>
            </tr>
            """
        best = tuning.get("best_hyperparameters", {})
        html += f"""
        <div class="card">
            <h2>2. Hyperparameter Optimization & Tuning</h2>
            <p><strong>Best Selected Configuration:</strong> Optimizer: {best.get("optimizer")}, LR: {best.get("learning_rate")}, Dropout: {best.get("dropout") or best.get("dropout_rate")}, Batch: {best.get("batch_size")}</p>
            <table>
                <thead>
                    <tr>
                        <th>Trial</th>
                        <th>Optimizer</th>
                        <th>Learning Rate</th>
                        <th>Dropout</th>
                        <th>Batch Size</th>
                        <th>Val Accuracy</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {trials_rows}
                </tbody>
            </table>
        </div>
        """
        
    # 3. Model Comparison Section
    if comparison:
        comp_rows = ""
        for arch, m in comparison.items():
            comp_rows += f"""
            <tr>
                <td><strong>{arch}</strong></td>
                <td>{m.get("val_accuracy", 0.0):.4f}</td>
                <td>{m.get("latency_ms", 0.0):.1f} ms</td>
                <td>{m.get("fps", 0.0):.1f} FPS</td>
                <td>{m.get("model_size_mb", 0.0):.1f} MB</td>
                <td>{m.get("trainable_parameters", 0):,}</td>
                <td>{m.get("duration_seconds", 0.0)/60.0:.1f} min</td>
            </tr>
            """
        html += f"""
        <div class="card">
            <h2>3. Multi-Architecture Baseline Comparison</h2>
            <table>
                <thead>
                    <tr>
                        <th>Architecture</th>
                        <th>Accuracy (Fold 0)</th>
                        <th>Latency</th>
                        <th>FPS (CPU)</th>
                        <th>Model Size</th>
                        <th>Params Count</th>
                        <th>Training Time</th>
                    </tr>
                </thead>
                <tbody>
                    {comp_rows}
                </tbody>
            </table>
        </div>
        """
        
    # 4. Cross Validation Section
    if cv:
        fold_accs = ", ".join([f"{acc:.4f}" for acc in cv.get("fold_accuracies", [])])
        html += f"""
        <div class="card">
            <h2>4. 5-Fold Stratified Cross-Validation Summary</h2>
            <p><strong>Selected Architecture:</strong> {cv.get("architecture")}</p>
            <div class="grid">
                <div class="stat-box success">
                    <div class="num">{cv.get("mean_accuracy", 0.0):.4f}</div>
                    <div class="label">Mean CV Accuracy</div>
                </div>
                <div class="stat-box">
                    <div class="num">&plusmn; {cv.get("std_accuracy", 0.0):.4f}</div>
                    <div class="label">Std Deviation</div>
                </div>
            </div>
            <p style="margin-top: 15px;"><strong>Folds Accuracies:</strong> [{fold_accs}]</p>
        </div>
        """

    # 5. Final Holdout Test Metrics Section
    if eval_metrics:
        overall = eval_metrics.get("overall", {})
        html += f"""
        <div class="card">
            <h2>5. Final Holdout Test Split Metrics & Calibration</h2>
            <div class="grid">
                <div class="stat-box success">
                    <div class="num">{overall.get("accuracy", 0.0):.4f}</div>
                    <div class="label">Test Accuracy (Top-1)</div>
                </div>
                <div class="stat-box success">
                    <div class="num">{overall.get("top3_accuracy", 0.0):.4f}</div>
                    <div class="label">Top-3 Accuracy</div>
                </div>
                <div class="stat-box">
                    <div class="num">{overall.get("mcc", 0.0):.4f}</div>
                    <div class="label">Mathews Correlation (MCC)</div>
                </div>
                <div class="stat-box">
                    <div class="num">{overall.get("calibration_ece", 0.0):.4f}</div>
                    <div class="label">Calibration Error (ECE)</div>
                </div>
            </div>
            
            <div class="image-container">
                <div class="image-card">
                    <img src="reliability_diagram.png" alt="Reliability Calibration Diagram" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <p style="display:none; color:#e74c3c;">Calibration Plot not generated</p>
                    <p>Confidence-to-Accuracy Reliability Diagram</p>
                </div>
                <div class="image-card">
                    <img src="roc_curves.png" alt="ROC Evaluation curves" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                    <p style="display:none; color:#e74c3c;">ROC Plot not generated</p>
                    <p>Receiver Operating Characteristic (ROC) Curves</p>
                </div>
            </div>
        </div>
        """
        
    # 6. Deployment Section
    if deployment:
        dep_rows = ""
        formats = deployment.get("formats_benchmarks", {})
        rec = deployment.get("recommended_deployment_format", "Keras")
        
        for fmt, metrics in formats.items():
            is_rec = f' <span class="badge badge-recommended">Recommended</span>' if fmt == rec else ""
            dep_rows += f"""
            <tr>
                <td><strong>{fmt}</strong>{is_rec}</td>
                <td>{metrics.get("size_mb", 0.0):.2f} MB</td>
                <td>{metrics.get("latency_ms", 0.0):.2f} ms</td>
                <td>{metrics.get("fps", 0.0):.1f} FPS</td>
            </tr>
            """
        html += f"""
        <div class="card">
            <h2>6. Production Export & Deployment Optimizations</h2>
            <p><strong>Automatically Selected Format:</strong> {rec}</p>
            <table>
                <thead>
                    <tr>
                        <th>Format Target</th>
                        <th>File Size</th>
                        <th>Inference Latency (Single item)</th>
                        <th>Throughput (FPS)</th>
                    </tr>
                </thead>
                <tbody>
                    {dep_rows}
                </tbody>
            </table>
        </div>
        """
        
    html += """
    </body>
    </html>
    """
    
    # Save file
    html_path = os.path.join(PipelineConfig.REPORTS_DIR, "project_summary.html")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
        
    logger.info(f"Saved compiled project report to: {html_path}")
    return html_path
