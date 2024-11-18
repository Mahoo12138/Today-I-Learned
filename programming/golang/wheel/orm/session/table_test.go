package session_test

import (
	"fmt"
	"mahoo12138/wheel/orm"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

type User struct {
	Name string `orm:"PRIMARY KEY"`
	Age  int
}

func TestSession_CreateTable(t *testing.T) {
	engine, err := orm.NewEngine("sqlite3", "../gee.db")
	if err != nil {
		fmt.Printf("Error: %s", err)
	}
	defer engine.Close()

	s := engine.NewSession().Model(&User{})
	_ = s.DropTable()
	_ = s.CreateTable()
	if !s.HasTable() {
		t.Fatal("Failed to create table User")
	}
}
