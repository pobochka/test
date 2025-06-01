import React from "react";
import Table from "./components/Table";
import Form from "./components/Form";
import { useState } from "react";

const App: React.FC = () => {
  const [reload, setReload] = useState(0);

  const handleSuccess = () => {
    setReload((prev) => prev + 1); // триггер перерисовки таблицы
  };
  return (
    <>
      <Table reload={reload} />
      <Form onSuccess={handleSuccess} />
    </>
  );
};

export default App;
