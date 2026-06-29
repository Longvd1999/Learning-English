;;; ============================================================
;;; TEXT_TO_EXCEL.lsp  (v1.0)
;;; Tac gia  : Antigravity (AI Assistant)
;;; Mo ta   :
;;;   Chuyen cac doi tuong TEXT / MTEXT sap xep theo
;;;   hang va cot trong AutoCAD sang file CSV (mo duoc bang Excel).
;;;
;;;   Nguyen tac hoat dong:
;;;     1. Nguoi dung chon vung chua cac Text/MText
;;;     2. Chuong trinh doc toa do (X, Y) va noi dung tung text
;;;     3. Sap xep theo HANG (Y giam dan) va COT (X tang dan)
;;;     4. Nhom cac text co Y gan nhau vao cung 1 hang (dung tolerance)
;;;     5. Xuat ra file .CSV => mo truc tiep bang Microsoft Excel
;;;
;;; Lenh goi : T2E  hoac  TEXT2EXCEL
;;; ============================================================

;;; ============================================================
;;; HAM PHU TRO
;;; ============================================================

;; Loai bo ky tu xuong dong, tab trong chuoi (tranh loi CSV)
(defun t2e_clean_str (s)
  (setq s (vl-string-subst " " "\n" s))
  (setq s (vl-string-subst " " "\r" s))
  (setq s (vl-string-subst " " "\t" s))
  ;; Neu chuoi chua dau phay hoac ngoac kep, boc bang ""
  (if (or (vl-string-search "," s)
          (vl-string-search "\"" s))
    (strcat "\"" (vl-string-subst "\"\"" "\"" s) "\"")
    s
  )
)

;; Lay noi dung text (ho tro ca TEXT va MTEXT)
(defun t2e_get_text (ent / ed obj)
  (setq ed (entget ent))
  (cond
    ;; MTEXT: dung vlax de lay TextString (sach hon DXF 1)
    ((= (cdr (assoc 0 ed)) "MTEXT")
     (setq obj (vlax-ename->vla-object ent))
     (vla-get-TextString obj)
    )
    ;; TEXT / ATTDEF / ATTRIB
    (t
     (cond
       ((assoc 1 ed)  (cdr (assoc 1 ed)))
       (t "")
     )
    )
  )
)

;; Lay diem chen (insertion point) cua text
(defun t2e_get_pt (ent / ed)
  (setq ed (entget ent))
  (cond
    ;; MTEXT dung DXF 10
    ((= (cdr (assoc 0 ed)) "MTEXT")
     (cdr (assoc 10 ed))
    )
    ;; TEXT
    (t
     (cdr (assoc 10 ed))
    )
  )
)

;; Sap xep danh sach theo gia tri thu n trong moi phan tu (bubble sort don gian)
(defun t2e_sort_by (lst idx asc / i j tmp n swapped)
  (setq n (length lst))
  (setq i 0)
  (while (< i (1- n))
    (setq j 0)
    (setq swapped nil)
    (while (< j (- n i 1))
      (setq a_val (nth idx (nth j lst)))
      (setq b_val (nth idx (nth (1+ j) lst)))
      (if (if asc (> a_val b_val) (< a_val b_val))
        (progn
          (setq tmp (nth j lst))
          (setq lst (t2e_list_set lst j (nth (1+ j) lst)))
          (setq lst (t2e_list_set lst (1+ j) tmp))
          (setq swapped T)
        )
      )
      (setq j (1+ j))
    )
    (if (not swapped) (setq i n))  ; thoat som neu da sorted
    (setq i (1+ i))
  )
  lst
)

;; Set phan tu thu idx cua list
(defun t2e_list_set (lst idx val / i result)
  (setq i 0 result nil)
  (foreach item lst
    (if (= i idx)
      (setq result (append result (list val)))
      (setq result (append result (list item)))
    )
    (setq i (1+ i))
  )
  result
)

;; Nhom cac text co Y gan nhau vao cung hang (dua vao tolerance)
(defun t2e_group_rows (sorted_list tol / rows cur_row cur_y item y_val)
  (setq rows nil  cur_row nil  cur_y nil)
  (foreach item sorted_list
    (setq y_val (cadr item))   ; item = (text x y)
    (cond
      ;; Hang dau tien
      ((null cur_y)
       (setq cur_y y_val)
       (setq cur_row (list item))
      )
      ;; Cung hang cu (Y cach nhau < tol)
      ((< (abs (- cur_y y_val)) tol)
       (setq cur_row (append cur_row (list item)))
      )
      ;; Hang moi
      (t
       ;; Luu hang cu
       (setq rows (append rows (list cur_row)))
       ;; Bat dau hang moi
       (setq cur_y y_val)
       (setq cur_row (list item))
      )
    )
  )
  ;; Luu hang cuoi
  (if cur_row
    (setq rows (append rows (list cur_row)))
  )
  rows
)

;; Tinh chieu cao text trung binh (de dung lam tolerance)
(defun t2e_avg_height (sel / i ent ed h sum cnt)
  (setq sum 0.0  cnt 0  i 0)
  (while (< i (sslength sel))
    (setq ent (ssname sel i))
    (setq ed (entget ent))
    (setq h (cdr (assoc 40 ed)))
    (if h (progn (setq sum (+ sum h)) (setq cnt (1+ cnt))))
    (setq i (1+ i))
  )
  (if (> cnt 0) (/ sum cnt) 5.0)
)

;; Hien thi hop thoai chon file save
(defun t2e_get_savepath (/ path)
  (setq path
    (getfiled
      "Luu file CSV"         ; tieu de
      ""                     ; thu muc mac dinh (thu muc hien tai)
      "csv"                  ; filter extension
      1                      ; flags: 1 = allow new filename
    )
  )
  path
)

;;; ============================================================
;;; LENH CHINH: T2E
;;; ============================================================
(defun c:T2E (/ *error* sel total i ent etype
                txt_list pt txt item
                avg_h tol
                sorted_by_y rows row_data
                out_path file_id
                row_items sorted_row
                max_cols col_idx line_str
                col_count r_idx
               )

  (defun *error* (msg)
    (if file_id (close file_id))
    (if (not (member msg '("Function cancelled" "quit / exit abort" "")))
      (princ (strcat "\n** Loi: " msg " **"))
    )
    (princ)
  )

  (vl-load-com)

  (princ "\n=== CHUYEN TEXT HANG/COT -> EXCEL (CSV)  v1.0 ===")
  (princ "\nChon cac Text / MText can xuat: ")

  ;; ---- 1. Chon doi tuong ----
  (setq sel (ssget '((0 . "TEXT,MTEXT"))))
  (if (null sel)
    (progn (princ "\nKhong co doi tuong duoc chon. Thoat.") (exit))
  )

  (setq total (sslength sel))
  (princ (strcat "\n  Da chon: " (itoa total) " doi tuong."))

  ;; ---- 2. Doc du lieu ----
  (setq txt_list nil)
  (setq i 0)
  (while (< i total)
    (setq ent (ssname sel i))
    (setq etype (cdr (assoc 0 (entget ent))))
    (if (member etype '("TEXT" "MTEXT"))
      (progn
        (setq pt  (t2e_get_pt  ent))
        (setq txt (t2e_get_text ent))
        ;; item = (noi_dung  X  Y)
        (setq txt_list
          (append txt_list
            (list (list txt (car pt) (cadr pt)))
          )
        )
      )
    )
    (setq i (1+ i))
  )

  (if (null txt_list)
    (progn (princ "\nKhong doc duoc du lieu. Thoat.") (exit))
  )

  ;; ---- 3. Tinh tolerance (0.7 * chieu cao text trung binh) ----
  (setq avg_h (t2e_avg_height sel))
  (setq tol   (* avg_h 0.7))
  (princ (strcat "\n  Chieu cao text tb: " (rtos avg_h 2 2)))
  (princ (strcat "\n  Tolerance hang   : " (rtos tol   2 2)))

  ;; ---- 4. Sap xep: Y GIAM DAN (hang tren truoc), X TANG DAN ----
  ;;   item = (text X Y) => idx 0=text, 1=X, 2=Y
  (setq sorted_by_y (t2e_sort_by txt_list 2 nil))   ; Y giam dan

  ;; ---- 5. Nhom hang ----
  (setq rows (t2e_group_rows sorted_by_y tol))
  (princ (strcat "\n  So hang phat hien: " (itoa (length rows))))

  ;; ---- 6. Tinh so cot toi da ----
  (setq max_cols 0)
  (foreach row_data rows
    (if (> (length row_data) max_cols)
      (setq max_cols (length row_data))
    )
  )
  (princ (strcat "\n  So cot toi da   : " (itoa max_cols)))

  ;; ---- 7. Chon duong dan luu file ----
  (setq out_path (t2e_get_savepath))
  (if (null out_path)
    (progn (princ "\n[Huy] Khong chon file. Thoat.") (exit))
  )

  ;; ---- 8. Ghi file CSV ----
  (setq file_id (open out_path "w"))
  (if (null file_id)
    (progn
      (princ (strcat "\n** Khong mo duoc file de ghi: " out_path))
      (exit)
    )
  )

  ;; Ghi tung hang
  (setq r_idx 0)
  (foreach row_data rows
    ;; Sap xep cot trong hang theo X tang dan
    (setq sorted_row (t2e_sort_by row_data 1 t))   ; X tang dan

    ;; Xay dung dong CSV
    (setq line_str "")
    (setq col_count (length sorted_row))
    (setq col_idx 0)
    (foreach item sorted_row
      (setq line_str
        (strcat line_str (t2e_clean_str (car item)))
      )
      (if (< col_idx (1- col_count))
        (setq line_str (strcat line_str ","))
      )
      (setq col_idx (1+ col_idx))
    )

    (write-line line_str file_id)
    (setq r_idx (1+ r_idx))
  )

  (close file_id)
  (setq file_id nil)

  ;; ---- 9. Thong bao ket qua ----
  (princ (strcat "\n\n[OK] Da xuat " (itoa r_idx) " hang x "
                 (itoa max_cols) " cot"))
  (princ (strcat "\n     File: " out_path))
  (princ "\n     Mo file bang Excel hoac Notepad de kiem tra.")
  (princ)
)

;;; Alias lenh
(defun c:TEXT2EXCEL () (c:T2E))

(princ "\n[TEXT_TO_EXCEL] Loaded. Lenh: T2E  hoac  TEXT2EXCEL")
(princ)

;;; ============================================================
;;; EOF
;;; ============================================================
