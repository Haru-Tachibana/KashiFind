package com.kashifind.dto;

public class PaginationResponse {
    private int page;
    private int limit;
    private long total;
    private int pages;
    
    public PaginationResponse() {}
    
    public PaginationResponse(int page, int limit, long total, int pages) {
        this.page = page;
        this.limit = limit;
        this.total = total;
        this.pages = pages;
    }
    
    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public int getLimit() { return limit; }
    public void setLimit(int limit) { this.limit = limit; }
    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public int getPages() { return pages; }
    public void setPages(int pages) { this.pages = pages; }
}

