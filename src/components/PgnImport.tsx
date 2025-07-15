import React, { useRef, useState } from "react";
import { useSetAtom } from "jotai";
import { gameAtom } from "@/sections/play/states";
import { Chess } from "chess.js";
import { Button, TextField, Typography, Stack, Alert } from "@mui/material";
import { useRouter } from "next/router";
import { encode as encodeBase64 } from "js-base64";

const PgnImport: React.FC = () => {
  const setGame = useSetAtom(gameAtom);
  const [pgn, setPgn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setPgn(text);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    setError(null);
    try {
      const chess = new Chess();
      chess.loadPgn(pgn); // If invalid, will throw
      setGame(chess);
      setPgn("");
      // Redirect to analysis page with PGN as base64 param
      const encodedPgn = encodeBase64(pgn);
      router.push({ pathname: "/", query: { pgn: encodedPgn } });
    } catch {
      setError("Invalid or unsupported PGN format.");
    }
  };

  return (
    <Stack spacing={2}>
      <Typography variant="h6">Import PGN</Typography>
      <Button
        variant="outlined"
        component="label"
        onClick={() => fileInputRef.current?.click()}
      >
        Upload PGN File
        <input
          type="file"
          accept=".pgn,text/plain"
          hidden
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </Button>
      <TextField
        label="Paste PGN here"
        multiline
        minRows={4}
        value={pgn}
        onChange={(e) => setPgn(e.target.value)}
        variant="outlined"
        fullWidth
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleImport}
        disabled={!pgn}
      >
        Import
      </Button>
      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
};

export default PgnImport;
