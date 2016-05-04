package main

import (
	"encoding/json"
	"fmt"
	"github.com/codeskyblue/go-sh"
	"io/ioutil"
	"log"
	"net/http"
	"strings"
)

type Temperature struct {
	Temp1 string `json:"temp1"`
	Temp2 string `json:"temp2"`
	Temp3 string `json:"temp3"`
	Temp4 string `json:"temp4"`
	Temp5 string `json:"temp5"`
}

func main() {
	http.HandleFunc("/gettemp", GetPredictedInsideTemp)
	log.Fatal(http.ListenAndServe(":9999", nil))
}

func GetPredictedInsideTemp(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Inside GetPredicted Temp")
	temperature := Temperature{}
	sh.Command("python", "./prediction_temperature.py").Output()
	content, err := ioutil.ReadFile("myfile.txt")
	if err != nil {
		panic(err)
	}
	fmt.Print(string(content))
	lines := strings.Split(string(content), "\n")

	temperature.Temp1 = lines[0]
	temperature.Temp2 = lines[1]
	temperature.Temp3 = lines[2]
	temperature.Temp4 = lines[3]
	temperature.Temp5 = lines[4]

	w.Header().Set("Content-Type", "application/json; charset=UTF-8")
	w.WriteHeader(200)
	json.NewEncoder(w).Encode(temperature)
}
