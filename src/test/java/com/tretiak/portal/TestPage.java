package com.tretiak.portal;

import lombok.Data;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.Iterator;
import java.util.List;
import java.util.function.Function;

@Data
public class TestPage<T> implements Page<T> {
    private long totalElements;
    private int totalPages;
    private int number;
    private int numberOfElements;
    private int size;
    private boolean last;
    private boolean first;
    private boolean next;
    private boolean previous;

    private List<T> content;

    @Override
    public boolean hasContent() {
        return false;
    }

    @Override
    public Sort getSort() {
        return null;
    }

    @Override
    public boolean hasNext() {
        return next;
    }

    @Override
    public boolean hasPrevious() {
        return previous;
    }

    @Override
    public Pageable nextPageable() {
        return null;
    }

    @Override
    public Pageable previousPageable() {
        return null;
    }

    @Override
    public <U> Page<U> map(Function<? super T, ? extends U> function) {
        return null;
    }

    @Override
    public Iterator<T> iterator() {
        return null;
    }
}
