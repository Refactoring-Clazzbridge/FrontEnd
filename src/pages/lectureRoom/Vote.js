import React, { useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Box } from '@mui/material';

const Vote = () => {
  // 투표 데이터
  const [rows, setRows] = useState([
    { id: 1, option: 'Option 1', votes: 0 },
    { id: 2, option: 'Option 2', votes: 0 },
    { id: 3, option: 'Option 3', votes: 0 },
    { id: 4, option: 'Option 4', votes: 0 },
  ]);

  // 선택된 행 ID 저장
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // 투표하기 함수
  const handleVote = () => {
    const updatedRows = rows.map((row) => {
      if (selectedRowIds.includes(row.id)) {
        return { ...row, votes: row.votes + 1 }; // 투표 수 증가
      }
      return row;
    });

    setRows(updatedRows); // 업데이트된 행 설정
    setSelectedRowIds([]); // 선택 초기화
    console.log('Updated Votes:', updatedRows); // 콘솔에 투표 결과 표시
  };

  // DataGrid 컬럼 설정
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    { field: 'option', headerName: '투표 항목', width: 200 },
    { field: 'votes', headerName: '투표 수', width: 150 },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        checkboxSelection
        onSelectionModelChange={(ids) => setSelectedRowIds(ids)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleVote}
        disabled={selectedRowIds.length === 0} // 아무 것도 선택되지 않았을 때 비활성화
        sx={{ marginTop: 2 }}
      >
        투표하기
      </Button>
    </Box>
  );
};

export default Vote;
