;;; ============================================================
;;; OFFSET_DONGMUC.lsp  (v2.0 - All-in-One, stable)
;;; Tac gia  : Antigravity (AI Assistant)
;;; Mo ta   :
;;;   - File DUY NHAT, khong can file DCL ngoai
;;;   - Dialog DCL nhap thong so (nho gia tri lan truoc)
;;;   - Offset VAOTRONG deu nhau (dung centroid - on dinh)
;;;   - Gan cao do Z (elevation, DXF 38) cho tung duong
;;;   - Ghi text cao do DANG DAI doc theo duong, xoay theo chieu duong
;;;   - Dau do doc: +tang / -giam vao trong
;;; Lenh goi: ODONGMUC
;;; ============================================================

;;; ============================================================
;;; LENH CHINH
;;; ============================================================
(defun c:ODONGMUC (/ *error*
                     sel ent entType
                     cao_do_dau do_doc chenh_cao
                     offset_dist sign_doc
                     txt_height txt_spacing
                     layer_name txt_layer
                     cur_ent cur_cao
                     new_ent
                     iter max_iter
                    )

  (defun *error* (msg)
    (if (not (member msg '("Function cancelled" "quit / exit abort" "")))
      (princ (strcat "\n** Loi: " msg " **")))
    (princ)
  )

  (princ "\n=== OFFSET DUONG DONG MUC SAN NEN  v2.0 ===")

  ;; ---- 1. Hien thi Dialog DCL ----
  (if (not (odm_show_dialog))
    (progn (princ "\n[Huy]") (exit))
  )

  (setq cao_do_dau  *odm_cao_do*)
  (setq do_doc      *odm_do_doc*)
  (setq chenh_cao   *odm_chenh_cao*)
  (setq txt_height  *odm_txt_h*)
  (setq txt_spacing *odm_spacing*)

  ;; ---- 2. Chon duong bo lo ----
  (setq sel (entsel "\nClick vao duong bo lo ngoai cung: "))
  (if (null sel) (progn (princ "\nKhong chon duoc. Thoat.") (exit)))
  (setq ent (car sel))
  (setq entType (cdr (assoc 0 (entget ent))))
  (if (not (member entType '("LWPOLYLINE" "POLYLINE")))
    (progn (princ "\nCan chon LWPOLYLINE hoac POLYLINE. Thoat.") (exit)))

  ;; ---- 3. Tinh toan ----
  (setq sign_doc    (if (> do_doc 0.0) 1.0 -1.0))
  (setq offset_dist (/ chenh_cao (abs (/ do_doc 100.0))))

  (princ (strcat "\n\nThong so:"))
  (princ (strcat "\n  Cao do ngoai      : " (rtos cao_do_dau 2 2) " m"))
  (princ (strcat "\n  Do doc            : " (rtos do_doc 2 2) " %"))
  (princ (strcat "\n  Chenh cao         : " (rtos chenh_cao 2 3) " m"))
  (princ (strcat "\n  Khoang cach offset: " (rtos offset_dist 2 3) " m"))
  (princ (strcat "\n  Khoang cach text  : " (rtos txt_spacing 2 2) " m"))
  (princ (strcat "\n  Chieu cao chu     : " (rtos txt_height 2 2) " m"))
  (princ (strcat "\n  Huong cao do      : "
    (if (> sign_doc 0) "Tang dan (+)" "Giam dan (-)")))

  ;; ---- 4. Tao layer ----
  (setq layer_name (cdr (assoc 8 (entget ent))))
  (setq txt_layer  (strcat layer_name "_CAO_DO"))
  (odm_make_layer txt_layer 3)

  ;; ---- 5. Xu ly duong GOC ----
  (odm_set_elevation ent cao_do_dau)
  (odm_write_text_strip ent cao_do_dau txt_height txt_layer txt_spacing)
  (princ (strcat "\n\n[Goc] Cao do = " (rtos cao_do_dau 2 2) " m"))

  ;; ---- 6. Vong lap offset vao trong ----
  (setq cur_ent ent  cur_cao cao_do_dau  iter 0  max_iter 500)
  (princ "\nDang offset duong dong muc...")

  (while (< iter max_iter)
    (setq iter    (1+ iter))
    (setq cur_cao (+ cur_cao (* sign_doc chenh_cao)))
    (setq new_ent (odm_offset_inward cur_ent offset_dist))

    (if (null new_ent)
      (progn
        (princ (strcat "\n-> Da offset " (itoa (1- iter)) " duong. Dung."))
        (setq iter max_iter)
      )
      (progn
        (entmod (subst (cons 8 layer_name) (assoc 8 (entget new_ent)) (entget new_ent)))
        (entupd new_ent)
        (odm_set_elevation new_ent cur_cao)
        (odm_write_text_strip new_ent cur_cao txt_height txt_layer txt_spacing)
        (princ (strcat "\n  Duong " (itoa iter) ": " (rtos cur_cao 2 2) " m"))
        (setq cur_ent new_ent)
      )
    )
  )

  (princ "\n\n=== Hoan thanh! ===\n")
  (princ)
)

;;; ============================================================
;;; Offset LWPOLYLINE VAO TRONG dung centroid
;;; - Neu OFFSET tao nhieu entity (polyline phuc tap bi split):
;;;   giu cai co bbox lon nhat, xoa phan con lai
;;; ============================================================
(defun odm_offset_inward (src_ent dist /
                           all_before all_after
                           new_ents best_ent best_size
                           inside_pt e bbox w h sz)
  (setq all_before (odm_get_all_ents))

  ;; Dung winding-aware inside point (chinh xac hon centroid)
  (setq inside_pt (odm_get_inside_pt src_ent))
  (if (null inside_pt)
    (progn
      (setq bbox (odm_bbox src_ent))
      (if bbox
        (setq inside_pt (list
          (/ (+ (car (car bbox)) (car (cadr bbox))) 2.0)
          (/ (+ (cadr (car bbox)) (cadr (cadr bbox))) 2.0)
          0.0))
        (setq inside_pt '(0.0 0.0 0.0)))))

  (command "_.OFFSET" dist src_ent inside_pt "")
  (setq all_after (odm_get_all_ents))

  ;; Thu gom TAT CA entity moi
  (setq new_ents nil)
  (foreach e all_after
    (if (not (member e all_before))
      (setq new_ents (cons e new_ents))))

  (cond
    ((null new_ents) nil)
    ((= (length new_ents) 1)
     (setq best_ent (car new_ents))
     (if (odm_is_valid_poly best_ent) best_ent
       (progn (entdel best_ent) nil)))
    (t
     (setq best_ent nil  best_size -1.0)
     (foreach e new_ents
       (if (odm_is_valid_poly e)
         (progn
           (setq bbox (odm_bbox e))
           (if bbox
             (progn
               (setq w  (abs (- (car  (cadr bbox)) (car  (car bbox)))))
               (setq h  (abs (- (cadr (cadr bbox)) (cadr (car bbox)))))
               (setq sz (+ w h))
               (if (> sz best_size)
                 (setq best_ent e  best_size sz)))))))
     (foreach e new_ents
       (if (and (not (equal e best_ent)) (entget e))
         (entdel e)))
     best_ent)
  )
)

;;; ============================================================
;;; Tim diem CHAC CHAN nam TRONG polyline kin
;;; Dung Winding Order (Shoelace signed area):
;;;   - area > 0 : CCW -> inside = LEFT of travel  -> normal (-dy, dx)
;;;   - area < 0 : CW  -> inside = RIGHT of travel -> normal (dy, -dx)
;;; Lay midpoint canh dai nhat, dich vao trong 10% chieu dai canh
;;; Chinh xac hon vertex-average centroid cho polyline lom (concave)
;;; ============================================================
(defun odm_get_inside_pt (poly_ent /
                           verts n
                           sgn_area i j
                           p1 p2 dx dy len
                           best_len best_i
                           mid_x mid_y nx ny)
  (setq verts (odm_get_vertices poly_ent))
  (setq n (length verts))

  (if (< n 3)
    (odm_get_centroid poly_ent)  ; fallback cho polyline qua nho
    (progn
      ;; ---- 1. Tinh Signed Area (Shoelace) ----
      ;; > 0 = CCW (nguoc chieu kim dong ho)
      ;; < 0 = CW  (cung chieu kim dong ho)
      (setq sgn_area 0.0  i 0)
      (while (< i n)
        (setq j (rem (1+ i) n))
        (setq sgn_area (+ sgn_area
          (- (* (car  (nth i verts)) (cadr (nth j verts)))
             (* (car  (nth j verts)) (cadr (nth i verts))))))
        (setq i (1+ i)))
      ; khong chia 2 vi chi can dau cua area

      ;; ---- 2. Tim canh dai nhat ----
      (setq best_len -1.0  best_i 0  i 0)
      (while (< i n)
        (setq j   (rem (1+ i) n))
        (setq p1  (nth i verts)  p2 (nth j verts))
        (setq dx  (- (car p2)  (car p1)))
        (setq dy  (- (cadr p2) (cadr p1)))
        (setq len (sqrt (+ (* dx dx) (* dy dy))))
        (if (> len best_len) (setq best_len len  best_i i))
        (setq i (1+ i)))

      ;; ---- 3. Midpoint canh dai nhat ----
      (setq j    (rem (1+ best_i) n))
      (setq p1   (nth best_i verts)  p2 (nth j verts))
      (setq mid_x (/ (+ (car p1)  (car p2))  2.0))
      (setq mid_y (/ (+ (cadr p1) (cadr p2)) 2.0))
      (setq dx   (- (car p2)  (car p1)))
      (setq dy   (- (cadr p2) (cadr p1)))
      (setq len  (sqrt (+ (* dx dx) (* dy dy))))

      (if (> len 0.0001)
        (progn
          ;; Don vi hoa vector canh
          (setq dx (/ dx len)  dy (/ dy len))
          ;; Normal huong vao trong theo winding
          (if (> sgn_area 0.0)
            (progn (setq nx (- dy)) (setq ny dx))     ; CCW: left  (-dy,  dx)
            (progn (setq nx    dy)  (setq ny (- dx))) ; CW:  right ( dy, -dx)
          )
          ;; Dich tu midpoint vao trong 10% chieu dai canh
          (list (+ mid_x (* nx (* best_len 0.1)))
                (+ mid_y (* ny (* best_len 0.1)))
                0.0))
        ;; Fallback: dung centroid
        (odm_get_centroid poly_ent))
    )
  )
)


;;; ============================================================
;;; Ghi noi dung DCL ra file tam trong %TEMP%
;;; ============================================================
(defun odm_write_dcl (/ tmp_path f)
  (setq tmp_path (strcat (getenv "TEMP") "\\OFFSET_DONGMUC_tmp.dcl"))
  (setq f (open tmp_path "w"))
  (if (null f)
    (progn (princ "\n[Loi] Khong tao duoc file DCL tam!") (return nil)))
  (foreach ln (list
    "// OFFSET_DONGMUC_tmp.dcl - auto-generated"
    ""
    "odongmuc_dialog : dialog {"
    "  label = \"Offset Dong Muc San Nen  v2.0\";"
    ""
    "  : boxed_column {"
    "    label = \"Thong so\";"
    "    width = 56;"
    ""
    "    : row {"
    "      : text  { label = \"Cao do duong ngoai (m)            :\"; width = 36; }"
    "      : edit_box { key = \"cao_do\";      edit_width = 10; }"
    "    }"
    "    spacer_0;"
    "    : row {"
    "      : text  { label = \"Do doc (%)  [ + tang / - giam ]   :\"; width = 36; }"
    "      : edit_box { key = \"do_doc\";      edit_width = 10; }"
    "    }"
    "    spacer_0;"
    "    : row {"
    "      : text  { label = \"Chenh cao moi duong (m)           :\"; width = 36; }"
    "      : edit_box { key = \"chenh_cao\";   edit_width = 10; }"
    "    }"
    "    spacer_0;"
    "    : row {"
    "      : text  { label = \"Chieu cao chu (m)                 :\"; width = 36; }"
    "      : edit_box { key = \"txt_height\";  edit_width = 10; }"
    "    }"
    "    spacer_0;"
    "    : row {"
    "      : text  { label = \"Khoang cach text tren duong (m)   :\"; width = 36; }"
    "      : edit_box { key = \"txt_spacing\"; edit_width = 10; }"
    "    }"
    "  }"
    ""
    "  spacer;"
    "  : text { label = \"* Khoang offset = Chenh cao / |Do doc / 100|\"; alignment = centered; }"
    "  spacer;"
    ""
    "  ok_cancel;"
    "}"
  )
    (write-line ln f))
  (close f)
  tmp_path
)

;;; ============================================================
;;; DIALOG DCL - nho gia tri qua global vars *odm_*
;;; ============================================================
(defun odm_show_dialog (/ dcl_path dcl_id result
                          s_cao_do s_do_doc s_chenh_cao
                          s_txt_height s_txt_spacing
                          v_do_doc v_chenh_cao v_txt_h v_spc)

  (if (null *odm_cao_do*)    (setq *odm_cao_do*    10.00))
  (if (null *odm_do_doc*)    (setq *odm_do_doc*     0.50))
  (if (null *odm_chenh_cao*) (setq *odm_chenh_cao*  0.05))
  (if (null *odm_txt_h*)     (setq *odm_txt_h*      0.50))
  (if (null *odm_spacing*)   (setq *odm_spacing*    5.00))

  (setq dcl_path (odm_write_dcl))
  (if (null dcl_path) (return nil))

  (setq dcl_id (load_dialog dcl_path))
  (if (< dcl_id 0)
    (progn (princ "\n[Loi] Khong load duoc dialog!") (return nil)))
  (if (not (new_dialog "odongmuc_dialog" dcl_id))
    (progn (unload_dialog dcl_id) (princ "\n[Loi] Khong tao duoc dialog!") (return nil)))

  (set_tile "cao_do"      (rtos *odm_cao_do*    2 2))
  (set_tile "do_doc"      (rtos *odm_do_doc*    2 2))
  (set_tile "chenh_cao"   (rtos *odm_chenh_cao* 2 3))
  (set_tile "txt_height"  (rtos *odm_txt_h*     2 2))
  (set_tile "txt_spacing" (rtos *odm_spacing*   2 2))

  (action_tile "accept"
    (strcat
      "(setq s_cao_do      (get_tile \"cao_do\")"
      "      s_do_doc      (get_tile \"do_doc\")"
      "      s_chenh_cao   (get_tile \"chenh_cao\")"
      "      s_txt_height  (get_tile \"txt_height\")"
      "      s_txt_spacing (get_tile \"txt_spacing\")"
      "      v_do_doc      (atof s_do_doc)"
      "      v_chenh_cao   (atof s_chenh_cao)"
      "      v_txt_h       (atof s_txt_height)"
      "      v_spc         (atof s_txt_spacing))"
      "(cond"
      "  ((= v_do_doc 0.0)   (alert \"Do doc khong duoc bang 0!\"))"
      "  ((<= v_chenh_cao 0) (alert \"Chenh cao phai > 0!\"))"
      "  ((<= v_txt_h 0)     (alert \"Chieu cao chu phai > 0!\"))"
      "  ((<= v_spc 0)       (alert \"Khoang cach text phai > 0!\"))"
      "  (t                  (done_dialog 1)))"
    )
  )

  (setq result (start_dialog))
  (unload_dialog dcl_id)

  (if (= result 1)
    (progn
      (setq *odm_cao_do*    (atof s_cao_do))
      (setq *odm_do_doc*    (atof s_do_doc))
      (setq *odm_chenh_cao* (atof s_chenh_cao))
      (setq *odm_txt_h*     (atof s_txt_height))
      (setq *odm_spacing*   (atof s_txt_spacing))
      t)
    nil)
)

;;; ============================================================
;;; Gan cao do Z (elevation) - DXF code 38
;;; ============================================================
(defun odm_set_elevation (poly_ent elev / ed ed_new inserted)
  (setq ed (entget poly_ent))
  (if (assoc 38 ed)
    (setq ed_new (subst (cons 38 elev) (assoc 38 ed) ed))
    (progn
      (setq ed_new '()  inserted nil)
      (foreach pair ed
        (setq ed_new (append ed_new (list pair)))
        (if (and (= (car pair) 8) (null inserted))
          (progn
            (setq ed_new (append ed_new (list (cons 38 elev))))
            (setq inserted t))))))
  (entmod ed_new)
  (entupd poly_ent)
)

;;; ============================================================
;;; Ghi text dai doc theo polyline, xoay theo chieu duong
;;; ============================================================
(defun odm_write_text_strip (poly_ent cao_do h_txt lay spacing /
                              verts n is_closed txt_str lim
                              acc_len next_tgt seg_ang
                              i p1 p2 dx dy seg_len t_val ipt)
  (setq verts (odm_get_vertices poly_ent))
  (setq n (length verts))
  (if (>= n 2)
    (progn
      (setq is_closed (odm_is_closed_poly poly_ent))
      (setq txt_str   (rtos cao_do 2 2))
      (setq lim       (if is_closed n (1- n)))

      (setq seg_ang (odm_readable_angle (angle (nth 0 verts) (nth 1 verts))))
      (odm_place_text_at_pt (car verts) txt_str h_txt lay seg_ang)

      (setq acc_len 0.0  next_tgt spacing  i 0)

      (while (< i lim)
        (setq p1      (nth i verts))
        (setq p2      (nth (rem (1+ i) n) verts))
        (setq dx      (- (car p2)  (car p1)))
        (setq dy      (- (cadr p2) (cadr p1)))
        (setq seg_len (sqrt (+ (* dx dx) (* dy dy))))

        (if (> seg_len 0.0001)
          (progn
            (setq seg_ang (odm_readable_angle (angle p1 p2)))
            (while (<= next_tgt (+ acc_len seg_len))
              (setq t_val (/ (- next_tgt acc_len) seg_len))
              (setq ipt (list
                (+ (car p1) (* t_val dx))
                (+ (cadr p1) (* t_val dy))
                0.0))
              (odm_place_text_at_pt ipt txt_str h_txt lay seg_ang)
              (setq next_tgt (+ next_tgt spacing))
            )
            (setq acc_len (+ acc_len seg_len))
          )
        )
        (setq i (1+ i))
      )
    )
  )
)

;;; ============================================================
;;; Dat 1 TEXT tai pt, xoay theo rot_ang, can MIDDLE CENTER
;;; ============================================================
(defun odm_place_text_at_pt (pt txt_str h_txt lay rot_ang)
  (entmake
    (list
      (cons 0  "TEXT")  (cons 8  lay)
      (cons 10 pt)      (cons 40 h_txt)
      (cons 1  txt_str) (cons 50 rot_ang)
      (cons 72 1)       (cons 11 pt)
      (cons 73 2)       (cons 7  "Standard")
    )
  )
)

;;; ============================================================
;;; Goc "de doc": lat 180 do neu text huong sang trai
;;; ============================================================
(defun odm_readable_angle (ang / a)
  (setq a (rem ang (* 2.0 pi)))
  (if (< a 0.0) (setq a (+ a (* 2.0 pi))))
  (if (and (> a (* 0.5 pi)) (<= a (* 1.5 pi)))
    (setq a (rem (+ a pi) (* 2.0 pi))))
  a
)

;;; ============================================================
;;; Lay tat ca entity trong ban ve
;;; ============================================================
(defun odm_get_all_ents (/ ss lst i)
  (setq lst '())
  (setq ss (ssget "X"))
  (if ss
    (progn
      (setq i 0)
      (while (< i (sslength ss))
        (setq lst (cons (ssname ss i) lst))
        (setq i (1+ i)))))
  lst
)

;;; ============================================================
;;; Trong tam xap xi cua LWPOLYLINE
;;; ============================================================
(defun odm_get_centroid (ent / ed sum_x sum_y n pt)
  (setq ed (entget ent)  sum_x 0.0  sum_y 0.0  n 0)
  (foreach pair ed
    (if (= (car pair) 10)
      (progn
        (setq pt (cdr pair))
        (setq sum_x (+ sum_x (car pt))
              sum_y (+ sum_y (cadr pt))
              n (1+ n)))))
  (if (> n 0) (list (/ sum_x n) (/ sum_y n) 0.0) nil)
)

;;; ============================================================
;;; Danh sach dinh cua LWPOLYLINE
;;; ============================================================
(defun odm_get_vertices (ent / ed verts)
  (setq verts '())
  (setq ed (entget ent))
  (foreach pair ed
    (if (= (car pair) 10)
      (setq verts (append verts
        (list (list (car (cdr pair)) (cadr (cdr pair)) 0.0))))))
  verts
)

;;; ============================================================
;;; Kiem tra polyline dong (DXF 70 bit 0)
;;; ============================================================
(defun odm_is_closed_poly (ent / ed fp)
  (setq ed (entget ent)  fp (assoc 70 ed))
  (if fp (= (logand (cdr fp) 1) 1) nil)
)

;;; ============================================================
;;; Bounding box -> ((xmin ymin) (xmax ymax))
;;; ============================================================
(defun odm_bbox (ent / minp maxp)
  (vla-GetBoundingBox (vlax-ename->vla-object ent) 'minp 'maxp)
  (list (vlax-safearray->list minp) (vlax-safearray->list maxp))
)

;;; ============================================================
;;; Tao layer neu chua ton tai
;;; ============================================================
(defun odm_make_layer (lay_name color)
  (if (null (tblsearch "LAYER" lay_name))
    (entmake
      (list (cons 0 "LAYER") (cons 100 "AcDbSymbolTableRecord")
            (cons 100 "AcDbLayerTableRecord") (cons 2 lay_name)
            (cons 70 0) (cons 62 color) (cons 6 "Continuous"))))
)

;;; ============================================================
;;; Kiem tra polyline hop le (>= 2 dinh)
;;; ============================================================
(defun odm_is_valid_poly (ent / ed n)
  (setq ed (entget ent)  n 0)
  (foreach pair ed (if (= (car pair) 10) (setq n (1+ n))))
  (> n 1)
)

;;; ---- Tai xong ----
(princ "\n[OK] Da tai OFFSET_DONGMUC.lsp  (v2.0 - stable)")
(princ "\n     Go lenh: ODONGMUC de chay")
(princ)
