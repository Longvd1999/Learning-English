// ============================================================
// OFFSET_DONGMUC.dcl  (v1.6)
// Dialog cho lenh ODONGMUC - Offset duong dong muc san nen
// ============================================================

odongmuc_dialog : dialog {
  label = "Offset Dong Muc San Nen  v1.6";

  : boxed_column {
    label = "Thong so dau vao";
    width = 52;

    : row {
      : text  { label = "Cao do duong ngoai (m)      :"; width = 30; }
      : edit_box { key = "cao_do";      edit_width = 10; }
    }
    spacer_0;
    : row {
      : text  { label = "Do doc (%)  [ + tang / - giam ] :"; width = 30; }
      : edit_box { key = "do_doc";      edit_width = 10; }
    }
    spacer_0;
    : row {
      : text  { label = "Chenh cao moi duong (m)     :"; width = 30; }
      : edit_box { key = "chenh_cao";   edit_width = 10; }
    }
    spacer_0;
    : row {
      : text  { label = "Chieu cao chu (m)           :"; width = 30; }
      : edit_box { key = "txt_height";  edit_width = 10; }
    }
    spacer_0;
    : row {
      : text  { label = "Khoang cach text tren duong (m) :"; width = 30; }
      : edit_box { key = "txt_spacing"; edit_width = 10; }
    }
  }

  spacer;

  : text {
    label = "Khoang offset = Chenh cao / |Do doc / 100|";
    alignment = centered;
  }
  : text {
    label = "Vi du: 0.05 / 0.005 = 10 m";
    alignment = centered;
  }

  spacer;

  ok_cancel;
}
