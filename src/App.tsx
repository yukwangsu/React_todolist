import { useState, useRef } from "react";
import "./App.css";

interface todoListItem {
  id: string;
  content: string;
}

function generateId() {
  return Math.random().toString(36).substring(7);
}

function App() {
  const defaultValue: string = "Write your next task here...";
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [todoList, setTodoList] = useState<todoListItem[]>([]);
  const draggingItemId = useRef<string>();
  const dragOverItemId = useRef<string>();

  const keyDown = (e: any) => {
    if (e.key === "Enter") {
      const text = e.target.value;
      e.target.value = "";
      let newId = generateId();
      while (
        todoList.find((item) => {
          item.id == newId;
        })
      ) {
        newId = generateId();
      }
      setTodoList((previous) => {
        return [...previous, { id: newId, content: text }];
      });
    }
  };

  return (
    <>
      <div className="main">
        <div className="title">
          <h2 className="title_text">pangsu의 react to-do list</h2>
        </div>
        <div>
          <input
            className="input"
            type="text"
            onFocus={() => {
              setIsFocused(true);
            }}
            onBlur={() => {
              setIsFocused(false);
            }}
            placeholder={isFocused ? "" : defaultValue}
            onKeyDown={(e) => keyDown(e)}
          ></input>
        </div>
        <div className="list">
          <div
            className="firstElement"
            onDragEnter={() => {
              dragOverItemId.current = "firstElement";
            }}
          ></div>
          {todoList.map((element) => (
            <ListElement
              key={element.id}
              item={element}
              submitChange={(updatedContent: string) => {
                for (let i: number = 0; i < todoList.length; i++) {
                  if (todoList[i].id == element.id) {
                    todoList[i].content = updatedContent;
                    const copy = [...todoList];
                    setTodoList(copy);
                    break;
                  }
                }
              }}
              deleteItem={() => {
                setTodoList((previous) => {
                  return previous.filter((item) => item.id !== element.id);
                });
              }}
              draggingItemStart={() => {
                draggingItemId.current = element.id;
              }}
              draggingItemEnter={() => {
                dragOverItemId.current = element.id;
              }}
              dragEnd={() => {
                // 예외: dragOver된 아이템이 없다면 그대로 종료
                if (!dragOverItemId.current) {
                  return;
                }
                //1. drag된 item을 복사
                const newDraggedItem = JSON.parse(
                  JSON.stringify(
                    todoList.find((item) => item.id === draggingItemId.current)
                  )
                );
                //2. 복사된 item에 새로운 id 부여
                let newId = generateId();
                while (
                  todoList.find((item) => {
                    item.id == newId;
                  })
                ) {
                  newId = generateId();
                }
                newDraggedItem.id = newId;
                //3. 복사된 item을 dragOver된 아이템의 뒤에 추가
                // (예외: dragOverItemId가 "firstElement"인 경우 제일 첫번째로 이동)
                if (dragOverItemId.current === "firstElement") {
                  todoList.splice(0, 0, newDraggedItem);
                  const copy = [...todoList];
                  setTodoList(copy);
                  dragOverItemId.current = undefined;
                } else {
                  for (let i: number = 0; i < todoList.length; i++) {
                    if (todoList[i].id === dragOverItemId.current) {
                      todoList.splice(i + 1, 0, newDraggedItem);
                      const copy = [...todoList];
                      setTodoList(copy);
                      dragOverItemId.current = undefined;
                      break;
                    }
                  }
                }
                //4. drag된 기존의 item을 삭제
                setTodoList((previous) => {
                  return previous.filter(
                    (item) => item.id !== draggingItemId.current
                  );
                });
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function ListElement({
  item,
  submitChange,
  deleteItem,
  draggingItemStart,
  draggingItemEnter,
  dragEnd,
}: {
  item: todoListItem;
  submitChange: (updatedContent: string) => void;
  deleteItem: () => void;
  draggingItemStart: () => void;
  draggingItemEnter: () => void;
  dragEnd: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(item.content);
  const [mouseOverOnSpace, setMouseOverOnSpace] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const keyDown = (e: any) => {
    if (e.key === "Enter") {
      submitChange(updatedContent);
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    } else {
      submitChange(updatedContent);
      setIsEditing(false);
    }
  };

  return (
    <>
      <div
        className="element"
        draggable
        onDragStart={() => {
          draggingItemStart();
          setIsDragging(true);
        }}
        onDragEnd={() => {
          dragEnd();
          setIsDragging(false);
        }}
        style={{
          opacity: isDragging ? 0.3 : 1,
        }}
      >
        {isEditing ? (
          <input
            className="editInput"
            value={updatedContent}
            onKeyDown={(e) => keyDown(e)}
            onChange={(e) => {
              setUpdatedContent(e.target.value);
            }}
          ></input>
        ) : (
          <p>{item.content}</p>
        )}
        <div className="spacer" />
        <button onClick={handleEdit}>{isEditing ? "적용" : "수정"}</button>
        <button onClick={deleteItem}>삭제</button>
      </div>
      <div
        className="spaceBetweenElement"
        style={{
          height: mouseOverOnSpace ? "40px" : "15px",
          transition: "height 0.2s ease",
        }}
        onDragEnter={() => {
          draggingItemEnter();
          setMouseOverOnSpace(true);
        }}
        onDragLeave={() => {
          setMouseOverOnSpace(false);
        }}
      ></div>
    </>
  );
}

export default App;
