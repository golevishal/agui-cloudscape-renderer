import { useMemo } from 'react';
import {
  Table,
  Box,
  Header,
  Pagination,
  TextFilter,
  StatusIndicator,
} from '@cloudscape-design/components';
import type { StatusIndicatorProps, TableProps } from '@cloudscape-design/components';
import { useCollection } from '@cloudscape-design/collection-hooks';
import type { A2UITablePayload } from '../types/agui';

function getStatusIndicatorType(value: string | number | boolean | null): StatusIndicatorProps['type'] {
  if (typeof value !== 'string') return 'info';
  
  const v = value.toLowerCase();
  if (v.includes('success') || v === 'ok' || v === 'completed') return 'success';
  if (v.includes('fail') || v === 'error' || v === 'rejected') return 'error';
  if (v.includes('pending') || v === 'in progress' || v === 'loading') return 'pending';
  if (v.includes('warn') || v === 'attention') return 'warning';
  
  return 'info';
}

interface A2UITableRendererProps {
  payload: A2UITablePayload;
}

export default function A2UITableRenderer({ payload }: A2UITableRendererProps) {
  const columnDefinitions = useMemo(() => {
    return payload.headers.map((header): TableProps.ColumnDefinition<Record<string, string | number | boolean | null>> => {
      const isStatusColumn = header.toLowerCase() === 'status';

      return {
        id: header,
        header: header,
        cell: item => {
          const value = item[header];
          if (isStatusColumn) {
             return (
               <StatusIndicator type={getStatusIndicatorType(value)}>
                 {String(value ?? '')}
               </StatusIndicator>
             );
          }
          return value != null ? String(value) : '-';
        },
        sortingField: header,
      };
    });
  }, [payload.headers]);

  const { items, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    payload.rows,
    {
      filtering: {
        empty: <Box textAlign="center" color="inherit">No resources found</Box>,
        noMatch: (
          <Box textAlign="center" color="inherit">
            <b>No matches</b>
            <Box variant="p" color="inherit">We can't find a match.</Box>
          </Box>
        ),
      },
      pagination: { pageSize: 10 },
      sorting: {},
      selection: {},
    }
  );

  return (
    <Table
      {...collectionProps}
      columnDefinitions={columnDefinitions}
      items={items}
      loadingText="Loading resources"
      filter={
        <TextFilter
          {...filterProps}
          countText={`${filteredItemsCount} matches`}
          filteringPlaceholder="Find resources"
        />
      }
      header={
        <Header
          counter={`(${filteredItemsCount})`}
        >
          Dynamic Resources Table
        </Header>
      }
      pagination={<Pagination {...paginationProps} />}
    />
  );
}
