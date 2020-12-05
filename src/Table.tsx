import { useState, useCallback, memo } from "react";

interface IRow {
  index: number;
  firstname: string;
  lastname: string;
  publicKey: string;
}

export interface IRowProps extends IRow {
  onClick: (row: IRow) => any;
}

export interface ITableProps {
  data: Array<IRow>;
  isExpensive: boolean;
}

const initialData = getData();
const MemoTable = memo(Table);
const MemoRow = memo(Row);
const MemoExpensiveRow = memo(ExpensiveRow)

export default function TableContainer() {
  const [fakeState, setFakeState] = useState(false);
  const [data, setData] = useState(initialData);
  const [isExpensive, setIsExpensive] = useState(true);

  return (
    <div>
      <button onClick={() => setData(getData())}>rerender</button>
      <button onClick={() => setData(initialData)}>
        rerender initial data
      </button>
      <button
        style={{ width: "100px" }}
        onClick={() => setIsExpensive((isExpensive) => !isExpensive)}
      >
        {isExpensive ? "expensive" : "cheap"}
      </button>
      <button onClick={() => setFakeState((prevState) => !prevState)}>
        change unrelated state
      </button>
      {/*
        case: "cheap" and click "unrelated state".
        The whole Table and its rows will re render although
        no changes were made.
      */}
      <Table data={data} isExpensive={isExpensive} />

      {/*
        case: "cheap" and click "unrelated state".
        With this memoized table version, it wont generate extra
        renders when only unrelated internal state of TableContainer
        changes. Show profiler.
      <MemoTable data={data} isExpensive={isExpensive} />
      */}
    </div>
  );
}

export function Table({ data, isExpensive }: ITableProps) {
  // case: "cheap" and clicking on "unrelated state"
  // result: this callback that is generated in each render will triger
  // the rendering of all the rows
  //const onRowClick = (row: IRow) => console.log("row clicked", row);

  // case: "cheap" and clicking on "unrelated state"
  // result: no unncesary re renders
  const onRowClick = useCallback(
    (row: IRow) => console.log("row clicked", row),
    []
  );

  return (
    <table>
      <thead>
        <tr>
          <th>index</th>
          <th>first name</th>
          <th>last name</th>
          <th>public key</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) =>
          isExpensive ? (
            // PRESENTATION: use MemoExpensiveRow
            // it only renders once
            <MemoExpensiveRow key={row.index} {...row} onClick={onRowClick} />
          ) : (
            // PRESENTATION: use MemoRow
            <Row key={row.index} {...row} onClick={onRowClick} />
          )
        )}
      </tbody>
    </table>
  );
}

export function Row(props: IRowProps) {
  return (
    <tr>
      <td>{props.index}</td>
      <td>{props.firstname}</td>
      <td>{props.lastname}</td>
      <td>{props.publicKey}</td>
    </tr>
  );
}

export function ExpensiveRow(props: IRowProps) {
  expensivePublicKey();

  return <Row {...props} />;
}

const LOAD = 1000;
export function expensivePublicKey(): string {
  let publicKey = "failed";
  try {
    // calculate cryptographically secure random values
    // to fake generate load
    for (let i = 0; i < LOAD; i++) {
      const buffer = new Uint32Array(10);
      publicKey = crypto.getRandomValues(buffer).join("").slice(0, 10);
    }
  } catch (err) {
    console.log(err);
  }

  return publicKey;
}

export function randomString(size = 7): string {
  return Math.random()
    .toString(36)
    .slice(2, size + 2);
}

export function getData(size = 100): Array<IRow> {
  return "0"
    .repeat(size)
    .split("")
    .map((_, index) => ({
      index,
      firstname: `juan-${randomString(4)}`,
      lastname: `lopez-${randomString(4)}`,
      publicKey: randomString(10),
    }));
}
