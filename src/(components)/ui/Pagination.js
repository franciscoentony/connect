"use client";

import { Pagination } from "@heroui/react";
import { useState } from "react";

const linkClass = "text-muted hover:bg-surface hover:text-foreground";
const activeClass = "bg-accent text-accent-foreground hover:bg-accent-hover";

export function PaginationUI({ paginas }) {
  const [page, setPage] = useState(1);

  return (
    <Pagination className="justify-center">
      <Pagination.Content className="gap-1 rounded-xl bg-default p-1">
        <Pagination.Item>
          <Pagination.Previous
            className={linkClass}
            isDisabled={page === 1}
            onPress={() => setPage((p) => p - 1)}
          >
            <Pagination.PreviousIcon />
          </Pagination.Previous>
        </Pagination.Item>
        {paginas.map((p) => (
          <Pagination.Item key={p}>
            <Pagination.Link
              className={p === page ? activeClass : linkClass}
              isActive={p === page}
              onPress={() => setPage(p)}
            >
              {p}
            </Pagination.Link>
          </Pagination.Item>
        ))}
        <Pagination.Item>
          <Pagination.Next
            className={linkClass}
            isDisabled={page === paginas.length}
            onPress={() => setPage((p) => p + 1)}
          >
            <Pagination.NextIcon />
          </Pagination.Next>
        </Pagination.Item>
      </Pagination.Content>
    </Pagination>
  );
}
