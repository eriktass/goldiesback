package com.githubexplorer.android;

import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.content.Intent;
import android.net.Uri;
import androidx.appcompat.app.AppCompatActivity;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import android.view.View;
import android.widget.ProgressBar;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private SwipeRefreshLayout swipeRefreshLayout;
    private ProgressBar progressBar;
    
    // Your Flask backend URL - update this with your actual deployment URL
    private static final String BASE_URL = "https://your-replit-app.replit.app";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        initViews();
        setupWebView();
        loadApplication();
    }
    
    private void initViews() {
        webView = findViewById(R.id.webview);
        swipeRefreshLayout = findViewById(R.id.swipe_refresh);
        progressBar = findViewById(R.id.progress_bar);
        
        swipeRefreshLayout.setOnRefreshListener(() -> {
            webView.reload();
        });
    }
    
    private void setupWebView() {
        WebSettings webSettings = webView.getSettings();
        
        // Enable JavaScript
        webSettings.setJavaScriptEnabled(true);
        
        // Enable DOM storage
        webSettings.setDomStorageEnabled(true);
        
        // Enable cache
        webSettings.setAppCacheEnabled(true);
        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Enable responsive design
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
        
        // Enable zooming
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false);
        
        // Set user agent for mobile optimization
        webSettings.setUserAgentString(webSettings.getUserAgentString() + " GitHubExplorer/1.0");
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                // Handle GitHub links externally
                if (url.startsWith("https://github.com")) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                
                // Handle other external links
                if (!url.startsWith(BASE_URL)) {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    startActivity(intent);
                    return true;
                }
                
                return false;
            }
            
            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                progressBar.setVisibility(View.VISIBLE);
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                progressBar.setVisibility(View.GONE);
                swipeRefreshLayout.setRefreshing(false);
                
                // Load offline page or show error message
                loadErrorPage();
            }
        });
    }
    
    private void loadApplication() {
        webView.loadUrl(BASE_URL);
    }
    
    private void loadErrorPage() {
        String errorHtml = "<!DOCTYPE html>" +
            "<html><head><title>GitHub Explorer</title>" +
            "<meta name='viewport' content='width=device-width, initial-scale=1'>" +
            "<style>body{font-family:Arial,sans-serif;text-align:center;padding:50px;}" +
            ".error{color:#e74c3c;font-size:18px;margin:20px 0;}" +
            ".retry-btn{background:#3498db;color:white;padding:10px 20px;border:none;border-radius:5px;font-size:16px;}" +
            "</style></head><body>" +
            "<h1>GitHub Explorer</h1>" +
            "<div class='error'>Unable to connect to server</div>" +
            "<p>Please check your internet connection and try again.</p>" +
            "<button class='retry-btn' onclick='location.reload()'>Retry</button>" +
            "</body></html>";
        
        webView.loadDataWithBaseURL(null, errorHtml, "text/html", "UTF-8", null);
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
    }
}